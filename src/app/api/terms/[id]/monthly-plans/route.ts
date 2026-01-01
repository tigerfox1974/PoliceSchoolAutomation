import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/terms/{termId}/monthly-plans - Aylık planları getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const termId = Array.isArray(params.id) ? params.id[0] : params.id
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : null
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : null

    if (!termId) {
      return NextResponse.json(
        { error: 'Dönem ID gereklidir' },
        { status: 400 }
      )
    }

    // Dönem var mı kontrol et
    const term = await prisma.term.findUnique({
      where: { id: termId, isDeleted: false },
    })

    if (!term) {
      return NextResponse.json(
        { error: 'Dönem bulunamadı' },
        { status: 404 }
      )
    }

    // TermCoursePlan'ları getir
    const termPlans = await prisma.termCoursePlan.findMany({
      where: { termId },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            programScope: true,
          },
        },
        monthlyPlans: {
          where: {
            ...(month && year ? { month, year } : {}),
          },
          orderBy: [
            { year: 'asc' },
            { month: 'asc' },
          ],
        },
      },
      orderBy: {
        course: {
          name: 'asc',
        },
      },
    })

    return NextResponse.json({ plans: termPlans })
  } catch (error) {
    console.error('Monthly plans fetch error:', error)
    return NextResponse.json(
      { error: 'Aylık planlar yüklenemedi' },
      { status: 500 }
    )
  }
}

// POST /api/terms/{termId}/monthly-plans/generate - Aylık planları otomatik oluştur
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const termId = Array.isArray(params.id) ? params.id[0] : params.id

    if (!termId) {
      return NextResponse.json(
        { error: 'Dönem ID gereklidir' },
        { status: 400 }
      )
    }

    // Dönem bilgilerini getir
    const term = await prisma.term.findUnique({
      where: { id: termId, isDeleted: false },
      include: {
        settings: true,
      },
    })

    if (!term) {
      return NextResponse.json(
        { error: 'Dönem bulunamadı' },
        { status: 404 }
      )
    }

    // TermCoursePlan'ları getir
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

    // Dönem başlangıç ve bitiş tarihlerini kullanarak ayları hesapla
    const startDate = new Date(term.startDate)
    const endDate = new Date(term.endDate)
    const months: Array<{ month: number; year: number }> = []

    let currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const month = currentDate.getMonth() + 1 // 1-12
      const year = currentDate.getFullYear()
      
      // Aynı ay/yıl zaten eklenmiş mi kontrol et
      if (!months.find(m => m.month === month && m.year === year)) {
        months.push({ month, year })
      }
      
      // Bir sonraki ayın ilk gününe geç
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    }

    if (months.length === 0) {
      return NextResponse.json(
        { error: 'Dönem tarihleri geçersiz' },
        { status: 400 }
      )
    }

    // Her TermCoursePlan için aylık planları EŞİT dağıt (dönem aylarına göre)
    // Not: Kullanıcı sonrasında manuel düzenleyebilir.
    const createdPlans: any[] = []
    const updatedPlans: any[] = []
    const deletedPlans: any[] = []
    const errors: string[] = []

    // Ayları kronolojik sırala
    const sortedMonths = [...months].sort((a, b) => (a.year - b.year) || (a.month - b.month))
    const allowedKeys = new Set(sortedMonths.map((m) => `${m.year}-${m.month}`))

    for (const termPlan of termPlans) {
      // Dönem dışında kalan aylık planları temizle (actualHours > 0 ise dokunma)
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

      // Var olan actualHours'u koru; plannedHours her zaman >= actualHours olsun.
      const existingByKey = new Map<string, { id: string; actualHours: number }>()
      for (const mp of termPlan.monthlyPlans) {
        const key = `${mp.year}-${mp.month}`
        existingByKey.set(key, { id: mp.id, actualHours: mp.actualHours || 0 })
      }

      for (let i = 0; i < sortedMonths.length; i++) {
        const m = sortedMonths[i]
        const key = `${m.year}-${m.month}`
        const desired = base + (i < remainder ? 1 : 0)
        const existing = existingByKey.get(key)
        const actual = existing?.actualHours ?? 0

        // plannedHours, actualHours'tan küçük olamaz
        const plannedHours = Math.max(desired, actual)

        try {
          const upserted = await prisma.monthlyCoursePlan.upsert({
            where: {
              termCoursePlanId_month_year: {
                termCoursePlanId: termPlan.id,
                month: m.month,
                year: m.year,
              },
            },
            create: {
              termCoursePlanId: termPlan.id,
              month: m.month,
              year: m.year,
              plannedHours,
              actualHours: actual,
            },
            update: {
              plannedHours,
              // actualHours'a dokunma
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

