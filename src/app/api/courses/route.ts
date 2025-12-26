import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Tüm dersleri listele
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const programScope = searchParams.get('programScope') // COMMON, POLIS_ONLY, ITFAIYE_ONLY
    const requiresLab = searchParams.get('requiresLab') // true/false

    const where: any = {
      isDeleted: false,
    }

    if (programScope) {
      where.programScope = programScope
    }

    if (requiresLab !== null) {
      where.requiresLab = requiresLab === 'true'
    }

    const courses = await prisma.course.findMany({
      where,
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
        _count: {
          select: {
            termCoursePlans: true,
            courseInstructors: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Courses fetch error:', error)
    return NextResponse.json(
      { error: 'Dersler yüklenemedi' },
      { status: 500 }
    )
  }
}

// Yeni ders oluştur
export async function POST(request: Request) {
  try {
    const data = await request.json()

    const {
      name,
      code,
      fourMonthHours,
      sixMonthHours,
      requiresLab,
      programScope,
      parentCourseId,
      weightPercentage,
      credit,
      description,
    } = data

    // Validasyon
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Ders adı ve kodu zorunludur' },
        { status: 400 }
      )
    }

    if (!fourMonthHours && !sixMonthHours) {
      return NextResponse.json(
        { error: 'En az bir dönem hedef saati girilmelidir' },
        { status: 400 }
      )
    }

    // Ders kodu unique kontrolü
    const existingCourse = await prisma.course.findFirst({
      where: {
        code: code.toUpperCase(),
        isDeleted: false,
      },
    })

    if (existingCourse) {
      return NextResponse.json(
        { error: 'Bu ders kodu zaten kullanılıyor' },
        { status: 400 }
      )
    }

    // Alt ders ise parent kontrolü
    if (parentCourseId) {
      const parent = await prisma.course.findUnique({
        where: { id: parentCourseId },
      })

      if (!parent) {
        return NextResponse.json(
          { error: 'Ana ders bulunamadı' },
          { status: 404 }
        )
      }

      if (!weightPercentage) {
        return NextResponse.json(
          { error: 'Alt ders için ağırlık yüzdesi zorunludur' },
          { status: 400 }
        )
      }
    }

    const course = await prisma.course.create({
      data: {
        name: name.trim(),
        code: code.toUpperCase().trim(),
        fourMonthHours: fourMonthHours ? parseInt(fourMonthHours) : null,
        sixMonthHours: sixMonthHours ? parseInt(sixMonthHours) : null,
        requiresLab: requiresLab ?? false,
        programScope: programScope || 'COMMON',
        credit: credit ? parseInt(credit) : null,
        description: description?.trim() || null,
        parentCourseId: parentCourseId || null,
        weightPercentage: weightPercentage ? parseFloat(weightPercentage) : null,
        courseType: 'STANDARD', // Varsayılan
      },
      include: {
        parentCourse: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, course })
  } catch (error) {
    console.error('Course create error:', error)
    return NextResponse.json(
      { error: 'Ders oluşturulamadı' },
      { status: 500 }
    )
  }
}

