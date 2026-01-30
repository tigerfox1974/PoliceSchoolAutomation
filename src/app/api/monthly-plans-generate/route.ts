import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/monthly-plans-generate
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const termId = body?.termId

    if (!termId) {
      return NextResponse.json(
        { error: 'Dönem ID gereklidir' },
        { status: 400 }
      )
    }

    const term = await prisma.term.findUnique({
      where: { id: termId, isDeleted: false },
      include: { settings: true },
    })

    if (!term) {
      return NextResponse.json(
        { error: 'Dönem bulunamadı' },
        { status: 404 }
      )
    }

    const termPlans = await prisma.termCoursePlan.findMany({
      where: { termId },
      include: {
        course: true,
        monthlyPlans: true,
      },
    })

    if (termPlans.length === 0) {
      return NextResponse.json(
        { error: 'Dönem planı bulunamadı. Önce dönem planı oluşturun.' },
        { status: 400 }
      )
    }

    const startDate = new Date(term.startDate)
    const endDate = new Date(term.endDate)
    const months: Array<{ month: number; year: number }> = []

    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const month = currentDate.getMonth() + 1
      const year = currentDate.getFullYear()
      if (!months.find((m) => m.month === month && m.year === year)) {
        months.push({ month, year })
      }
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    }

    if (months.length === 0) {
      return NextResponse.json(
        { error: 'Dönem tarihleri geçersiz' },
        { status: 400 }
      )
    }

    const createdPlans: any[] = []
    const updatedPlans: any[] = []
    const deletedPlans: any[] = []
    const errors: string[] = []

    const sortedMonths = [...months].sort((a, b) => (a.year - b.year) || (a.month - b.month))
    const allowedKeys = new Set(sortedMonths.map((m) => `${m.year}-${m.month}`))

    for (const termPlan of termPlans) {
      for (const mp of termPlan.monthlyPlans) {
        const key = `${mp.year}-${mp.month}`
        if (!allowedKeys.has(key) && (mp.actualHours || 0) === 0) {
          try {
            const del = await prisma.monthlyCoursePlan.delete({ where: { id: mp.id } })
            deletedPlans.push(del)
          } catch (error: any) {
            errors.push(`"${termPlan.course.name}" için ${mp.month}/${mp.year} dönem dışı planı silinemedi: ${error.message}`)
          }
        }
      }

      const monthCount = sortedMonths.length
      const total = Math.max(0, termPlan.totalPlannedHours || 0)
      const base = Math.floor(total / monthCount)
      const remainder = total % monthCount

      const existingByKey = new Map<string, { id: string; actualHours: number }>()
      for (const mp of termPlan.monthlyPlans) {
        const key = `${mp.year}-${mp.month}`
        existingByKey.set(key, { id: mp.id, actualHours: mp.actualHours || 0 })
      }

      for (let i = 0; i < sortedMonths.length; i++) {
        const m = sortedMonths[i]
        const key = `${m.year}-${m.month}`
        const plannedHours = base + (i < remainder ? 1 : 0)
        const existing = existingByKey.get(key)
        const actualHours = existing?.actualHours || 0
        const safePlanned = Math.max(plannedHours, actualHours)

        try {
          const upserted = await prisma.monthlyCoursePlan.upsert({
            where: existing ? { id: existing.id } : { id: `__new_${termPlan.id}_${key}` },
            create: {
              termCoursePlanId: termPlan.id,
              month: m.month,
              year: m.year,
              plannedHours: safePlanned,
              actualHours,
            },
            update: {
              plannedHours: safePlanned,
            },
          })

          if (existing) {
            updatedPlans.push(upserted)
          } else {
            createdPlans.push(upserted)
          }
        } catch (error: any) {
          errors.push(`"${termPlan.course.name}" için ${m.month}/${m.year} planı güncellenemedi: ${error.message}`)
        }
      }
    }

    const messageParts: string[] = []
    messageParts.push(`Aylık planlar dönem aylarına göre eşit dağıtıldı (${sortedMonths.length} ay)`) 
    messageParts.push(`Oluşturulan: ${createdPlans.length}`)
    messageParts.push(`Güncellenen: ${updatedPlans.length}`)
    if (deletedPlans.length > 0) messageParts.push(`Silinen (dönem dışı, actual=0): ${deletedPlans.length}`)
    const message = messageParts.join(' | ')

    return NextResponse.json({
      success: true,
      message,
      createdCount: createdPlans.length,
      updatedCount: updatedPlans.length,
      deletedCount: deletedPlans.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Monthly plans generate error:', error)
    return NextResponse.json(
      { error: 'Aylık planlar oluşturulamadı', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    )
  }
}
