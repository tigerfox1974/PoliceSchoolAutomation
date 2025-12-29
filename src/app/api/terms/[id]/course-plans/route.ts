import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/terms/{termId}/course-plans - Dönem planlarını getir
export async function GET(
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

    // Dönem planlarını getir
    const plans = await prisma.termCoursePlan.findMany({
      where: { termId },
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
        monthlyPlans: {
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

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Course plans fetch error:', error)
    return NextResponse.json(
      { error: 'Dönem planları yüklenemedi' },
      { status: 500 }
    )
  }
}

// POST /api/terms/{termId}/course-plans - Dönem planı oluştur
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

    const body = await request.json()
    const { plans } = body // [{ courseId, totalPlannedHours }, ...]

    if (!Array.isArray(plans) || plans.length === 0) {
      return NextResponse.json(
        { error: 'En az bir ders planı gereklidir' },
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

    // Validasyon: Her plan için courseId ve totalPlannedHours olmalı
    for (const plan of plans) {
      if (!plan.courseId || !plan.totalPlannedHours) {
        return NextResponse.json(
          { error: 'Her plan için courseId ve totalPlannedHours gereklidir' },
          { status: 400 }
        )
      }

      if (plan.totalPlannedHours <= 0) {
        return NextResponse.json(
          { error: 'Hedef saat 0\'dan büyük olmalıdır' },
          { status: 400 }
        )
      }

      // Ders var mı kontrol et
      const course = await prisma.course.findUnique({
        where: { id: plan.courseId, isDeleted: false },
      })

      if (!course) {
        return NextResponse.json(
          { error: `Ders bulunamadı: ${plan.courseId}` },
          { status: 404 }
        )
      }

      // Aynı dönemde aynı ders zaten planlanmış mı kontrol et
      const existingPlan = await prisma.termCoursePlan.findUnique({
        where: {
          termId_courseId: {
            termId,
            courseId: plan.courseId,
          },
        },
      })

      if (existingPlan) {
        return NextResponse.json(
          { error: `"${course.name}" dersi için zaten bir plan mevcut` },
          { status: 400 }
        )
      }
    }

    // Tüm planları oluştur
    const createdPlans = await Promise.all(
      plans.map((plan) =>
        prisma.termCoursePlan.create({
          data: {
            termId,
            courseId: plan.courseId,
            totalPlannedHours: parseInt(plan.totalPlannedHours),
            totalActualHours: 0,
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
      )
    )

    return NextResponse.json({
      success: true,
      plans: createdPlans,
      message: `${createdPlans.length} ders planı başarıyla oluşturuldu`,
    })
  } catch (error) {
    console.error('Course plan create error:', error)
    return NextResponse.json(
      { error: 'Dönem planı oluşturulamadı', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    )
  }
}

