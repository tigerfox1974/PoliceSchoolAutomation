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

    // Her TermCoursePlan için aylık planları oluştur
    const createdPlans: any[] = []
    const updatedPlans: any[] = []
    const errors: string[] = []

    for (const termPlan of termPlans) {
      // Mevcut aylık planları kontrol et
      const existingMonths = termPlan.monthlyPlans.map(mp => `${mp.year}-${mp.month}`)
      const missingMonths = months.filter(m => !existingMonths.includes(`${m.year}-${m.month}`))
      
      // Eğer tüm aylar mevcutsa atla
      if (missingMonths.length === 0) {
        continue
      }

      // Mevcut planlanan saatleri hesapla
      const existingPlannedHours = termPlan.monthlyPlans.reduce((sum, mp) => sum + mp.plannedHours, 0)
      const remainingHours = termPlan.totalPlannedHours - existingPlannedHours
      
      // Kalan saatleri eksik aylara dağıt
      const hoursPerMonth = Math.floor(remainingHours / missingMonths.length)
      const remainder = remainingHours % missingMonths.length

      // İlk eksik aylara kalan saatleri ekle
      for (let i = 0; i < missingMonths.length; i++) {
        const monthHours = hoursPerMonth + (i < remainder ? 1 : 0)

        try {
          const monthlyPlan = await prisma.monthlyCoursePlan.create({
            data: {
              termCoursePlanId: termPlan.id,
              month: missingMonths[i].month,
              year: missingMonths[i].year,
              plannedHours: monthHours,
              actualHours: 0,
            },
          })

          createdPlans.push(monthlyPlan)
        } catch (error: any) {
          // Unique constraint hatası (zaten varsa) atla
          if (error.code === 'P2002') {
            continue
          }
          errors.push(`"${termPlan.course.name}" için ${missingMonths[i].month}/${missingMonths[i].year} planı oluşturulamadı: ${error.message}`)
        }
      }
    }

    const totalCreated = createdPlans.length
    const message = totalCreated > 0 
      ? `${totalCreated} aylık plan oluşturuldu${updatedPlans.length > 0 ? `, ${updatedPlans.length} plan güncellendi` : ''}`
      : 'Tüm aylık planlar zaten mevcut'

    return NextResponse.json({
      success: true,
      message,
      createdCount: totalCreated,
      updatedCount: updatedPlans.length,
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

