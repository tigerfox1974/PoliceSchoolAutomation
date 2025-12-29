import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/terms/{termId}/course-plans/{planId} - Plan güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string; planId: string } }
) {
  try {
    const termId = Array.isArray(params.id) ? params.id[0] : params.id
    const planId = Array.isArray(params.planId) ? params.planId[0] : params.planId

    if (!termId || !planId) {
      return NextResponse.json(
        { error: 'Dönem ID ve Plan ID gereklidir' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { totalPlannedHours } = body

    if (!totalPlannedHours || totalPlannedHours <= 0) {
      return NextResponse.json(
        { error: 'Hedef saat 0\'dan büyük olmalıdır' },
        { status: 400 }
      )
    }

    // Plan var mı kontrol et
    const existingPlan = await prisma.termCoursePlan.findUnique({
      where: { id: planId },
      include: {
        term: true,
      },
    })

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plan bulunamadı' },
        { status: 404 }
      )
    }

    // Dönem ID eşleşiyor mu kontrol et
    if (existingPlan.termId !== termId) {
      return NextResponse.json(
        { error: 'Plan bu döneme ait değil' },
        { status: 400 }
      )
    }

    // Planı güncelle
    const updatedPlan = await prisma.termCoursePlan.update({
      where: { id: planId },
      data: {
        totalPlannedHours: parseInt(totalPlannedHours),
      },
      include: {
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            fourMonthHours: true,
            sixMonthHours: true,
            programScope: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
      message: 'Plan başarıyla güncellendi',
    })
  } catch (error) {
    console.error('Course plan update error:', error)
    return NextResponse.json(
      { error: 'Plan güncellenemedi', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    )
  }
}

// DELETE /api/terms/{termId}/course-plans/{planId} - Plan sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; planId: string } }
) {
  try {
    const termId = Array.isArray(params.id) ? params.id[0] : params.id
    const planId = Array.isArray(params.planId) ? params.planId[0] : params.planId

    if (!termId || !planId) {
      return NextResponse.json(
        { error: 'Dönem ID ve Plan ID gereklidir' },
        { status: 400 }
      )
    }

    // Plan var mı kontrol et
    const existingPlan = await prisma.termCoursePlan.findUnique({
      where: { id: planId },
      include: {
        term: true,
        monthlyPlans: true,
      },
    })

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plan bulunamadı' },
        { status: 404 }
      )
    }

    // Dönem ID eşleşiyor mu kontrol et
    if (existingPlan.termId !== termId) {
      return NextResponse.json(
        { error: 'Plan bu döneme ait değil' },
        { status: 400 }
      )
    }

    // Aylık planlar varsa uyarı ver (ama silmeye devam et, cascade delete çalışacak)
    if (existingPlan.monthlyPlans.length > 0) {
      // Cascade delete ile otomatik silinecek, sadece bilgilendirme
    }

    // Planı sil (cascade delete ile monthlyPlans da silinecek)
    await prisma.termCoursePlan.delete({
      where: { id: planId },
    })

    return NextResponse.json({
      success: true,
      message: 'Plan başarıyla silindi',
    })
  } catch (error) {
    console.error('Course plan delete error:', error)
    return NextResponse.json(
      { error: 'Plan silinemedi', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    )
  }
}

