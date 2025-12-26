import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Ders detayını getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const course = await prisma.course.findUnique({
      where: {
        id: params.id,
        isDeleted: false,
      },
      include: {
        parentCourse: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        subCourses: {
          select: {
            id: true,
            name: true,
            code: true,
            weightPercentage: true,
          },
          where: {
            isDeleted: false,
          },
        },
        courseInstructors: {
          include: {
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                title: true,
                instructorType: true,
              },
            },
          },
        },
        term: {
          select: {
            id: true,
            name: true,
            termCode: true,
          },
        },
        _count: {
          select: {
            dailyLessons: true,
            exams: true,
          },
        },
      },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Ders bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ course })
  } catch (error) {
    console.error('Course fetch error:', error)
    return NextResponse.json(
      { error: 'Ders bilgisi yüklenemedi' },
      { status: 500 }
    )
  }
}

// Dersi güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    const {
      name,
      code,
      fourMonthHours,
      sixMonthHours,
      requiresLab,
      programScope,
      credit,
      description,
      weightPercentage,
    } = data

    // Ders var mı kontrol et
    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id },
    })

    if (!existingCourse || existingCourse.isDeleted) {
      return NextResponse.json(
        { error: 'Ders bulunamadı' },
        { status: 404 }
      )
    }

    // Ders kodu değiştiriliyorsa, unique kontrolü
    if (code && code !== existingCourse.code) {
      const codeExists = await prisma.course.findFirst({
        where: {
          code: code.toUpperCase(),
          id: { not: params.id },
          isDeleted: false,
        },
      })

      if (codeExists) {
        return NextResponse.json(
          { error: 'Bu ders kodu başka bir ders tarafından kullanılıyor' },
          { status: 400 }
        )
      }
    }

    // Güncelleme verisi hazırla
    const updateData: any = {}

    if (name) updateData.name = name.trim()
    if (code) updateData.code = code.toUpperCase().trim()
    if (fourMonthHours !== undefined) updateData.fourMonthHours = fourMonthHours ? parseInt(fourMonthHours) : null
    if (sixMonthHours !== undefined) updateData.sixMonthHours = sixMonthHours ? parseInt(sixMonthHours) : null
    if (requiresLab !== undefined) updateData.requiresLab = requiresLab
    if (programScope) updateData.programScope = programScope
    if (credit !== undefined) updateData.credit = credit ? parseInt(credit) : null
    if (description !== undefined) updateData.description = description?.trim() || null
    if (weightPercentage !== undefined) updateData.weightPercentage = weightPercentage ? parseFloat(weightPercentage) : null

    const course = await prisma.course.update({
      where: { id: params.id },
      data: updateData,
      include: {
        parentCourse: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        subCourses: {
          select: {
            id: true,
            name: true,
            code: true,
            weightPercentage: true,
          },
          where: {
            isDeleted: false,
          },
        },
      },
    })

    return NextResponse.json({ success: true, course })
  } catch (error) {
    console.error('Course update error:', error)
    return NextResponse.json(
      { error: 'Ders güncellenemedi' },
      { status: 500 }
    )
  }
}

// Dersi sil (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Ders var mı kontrol et
    const existingCourse = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            dailyLessons: true,
            subCourses: true,
          },
        },
      },
    })

    if (!existingCourse || existingCourse.isDeleted) {
      return NextResponse.json(
        { error: 'Ders bulunamadı' },
        { status: 404 }
      )
    }

    // Aktif programda kullanılıyor mu kontrol et
    // Not: termCoursePlans henüz yok, dailyLessons kontrolü yeterli

    if (existingCourse._count.dailyLessons > 0) {
      return NextResponse.json(
        { 
          error: 'Bu dersin ders kayıtları mevcut. Silme yerine arşivlemeyi düşünün.',
          code: 'COURSE_HAS_LESSONS'
        },
        { status: 400 }
      )
    }

    // Soft delete yap
    await prisma.course.update({
      where: { id: params.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Ders başarıyla silindi'
    })
  } catch (error) {
    console.error('Course delete error:', error)
    return NextResponse.json(
      { error: 'Ders silinemedi' },
      { status: 500 }
    )
  }
}

