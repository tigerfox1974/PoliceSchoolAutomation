import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/monthly-plans/{id} - Aylık plan detayını getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const planId = Array.isArray(params.id) ? params.id[0] : params.id

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID gereklidir' },
        { status: 400 }
      )
    }

    const plan = await prisma.monthlyCoursePlan.findUnique({
      where: { id: planId },
      include: {
        termCoursePlan: {
          include: {
            course: {
              select: {
                id: true,
                code: true,
                name: true,
                programScope: true,
              },
            },
            term: {
              select: {
                id: true,
                name: true,
                termCode: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
      },
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Aylik plan bulunamadi' },
        { status: 404 }
      )
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Monthly plan fetch error:', error)
    return NextResponse.json(
      { error: 'Aylık plan yüklenemedi' },
      { status: 500 }
    )
  }
}

// PUT /api/monthly-plans/{id} - Aylık plan güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const planId = Array.isArray(params.id) ? params.id[0] : params.id

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID gereklidir' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { plannedHours, actualHours } = body

    // Plan var mı kontrol et (önce bunu yap, validasyon için gerekli)
    const existingPlan = await prisma.monthlyCoursePlan.findUnique({
      where: { id: planId },
      include: {
        termCoursePlan: {
          include: {
            monthlyPlans: true,
          },
        },
      },
    })

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Aylik plan bulunamadi' },
        { status: 404 }
      )
    }

    // Validasyon
    if (plannedHours !== undefined && (plannedHours < 0 || !Number.isInteger(plannedHours))) {
      return NextResponse.json(
        { error: 'Planlanan saat 0 veya pozitif bir tam sayi olmalidir' },
        { status: 400 }
      )
    }

    if (actualHours !== undefined) {
      if (actualHours < 0 || !Number.isInteger(actualHours)) {
        return NextResponse.json(
          { error: 'Gerceklesen saat 0 veya pozitif bir tam sayi olmalidir' },
          { status: 400 }
        )
      }
      
      // Gerçekleşen saat planlanandan fazla olamaz
      const maxAllowed = plannedHours !== undefined ? parseInt(plannedHours) : existingPlan.plannedHours
      if (actualHours > maxAllowed) {
        return NextResponse.json(
          { error: `Gerceklesen saat (${actualHours}) planlanan saatten (${maxAllowed}) fazla olamaz!` },
          { status: 400 }
        )
      }
    }

    // Güncelleme verilerini hazırla
    const updateData: any = {}
    let needsRebalance = false
    let newPlannedHours = existingPlan.plannedHours

    if (plannedHours !== undefined) {
      const newValue = parseInt(plannedHours)
      newPlannedHours = newValue
      updateData.plannedHours = newValue
      
      // Toplam saat korunması: Eğer değişiklik varsa diğer ayları ayarla
      if (newValue !== existingPlan.plannedHours) {
        needsRebalance = true
      }
    }
    
    if (actualHours !== undefined) {
      updateData.actualHours = parseInt(actualHours)
    }

    // Eğer plannedHours değiştiyse, toplam saat korunması için diğer ayları ayarla
    if (needsRebalance && plannedHours !== undefined) {
      const allMonthlyPlans = existingPlan.termCoursePlan.monthlyPlans
      const currentTotal = allMonthlyPlans.reduce((sum, mp) => {
        if (mp.id === planId) {
          return sum + newPlannedHours
        }
        return sum + mp.plannedHours
      }, 0)
      
      const targetTotal = existingPlan.termCoursePlan.totalPlannedHours
      const difference = currentTotal - targetTotal
      
      if (difference !== 0) {
        // Farkı diğer aylardan çıkar/ekle (son aydan başlayarak)
        const otherPlans = allMonthlyPlans
          .filter(mp => mp.id !== planId)
          .sort((a, b) => {
            // Önce yıla, sonra aya göre sırala (son ay en sonda)
            if (a.year !== b.year) return b.year - a.year
            return b.month - a.month
          })
        
        let remainingDiff = difference
        
        for (const otherPlan of otherPlans) {
          if (remainingDiff === 0) break
          
          const currentHours = otherPlan.plannedHours
          let newHours = currentHours
          
          if (remainingDiff > 0) {
            // Fazla var, azalt
            newHours = Math.max(0, currentHours - remainingDiff)
            remainingDiff -= (currentHours - newHours)
          } else {
            // Eksik var, ekle
            newHours = currentHours + Math.abs(remainingDiff)
            remainingDiff = 0
          }
          
          if (newHours !== currentHours) {
            await prisma.monthlyCoursePlan.update({
              where: { id: otherPlan.id },
              data: { plannedHours: newHours },
            })
          }
        }
      }
    }

    // Planı güncelle
    const updatedPlan = await prisma.monthlyCoursePlan.update({
      where: { id: planId },
      data: updateData,
      include: {
        termCoursePlan: {
          include: {
            course: {
              select: {
                id: true,
                code: true,
                name: true,
                programScope: true,
              },
            },
          },
        },
      },
    })

    // TermCoursePlan'ın totalActualHours'unu güncelle
    if (actualHours !== undefined) {
      const allMonthlyPlans = await prisma.monthlyCoursePlan.findMany({
        where: { termCoursePlanId: existingPlan.termCoursePlanId },
      })

      const totalActual = allMonthlyPlans.reduce((sum, plan) => sum + plan.actualHours, 0)

      await prisma.termCoursePlan.update({
        where: { id: existingPlan.termCoursePlanId },
        data: { totalActualHours: totalActual },
      })
    }

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
      message: 'Aylik plan basariyla guncellendi',
    })
  } catch (error) {
    console.error('Monthly plan update error:', error)
    return NextResponse.json(
      { error: 'Aylık plan güncellenemedi', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    )
  }
}

// DELETE /api/monthly-plans/{id} - Aylık plan sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const planId = Array.isArray(params.id) ? params.id[0] : params.id

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID gereklidir' },
        { status: 400 }
      )
    }

    const plan = await prisma.monthlyCoursePlan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Aylik plan bulunamadi' },
        { status: 404 }
      )
    }

    await prisma.monthlyCoursePlan.delete({
      where: { id: planId },
    })

    return NextResponse.json({
      success: true,
      message: 'Aylik plan basariyla silindi',
    })
  } catch (error) {
    console.error('Monthly plan delete error:', error)
    return NextResponse.json(
      { error: 'Aylık plan silinemedi' },
      { status: 500 }
    )
  }
}

