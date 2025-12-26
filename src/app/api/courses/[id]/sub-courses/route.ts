import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Alt dersleri listele
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const subCourses = await prisma.course.findMany({
      where: {
        parentCourseId: params.id,
        isDeleted: false,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ subCourses })
  } catch (error) {
    console.error('Sub-courses fetch error:', error)
    return NextResponse.json(
      { error: 'Alt dersler yüklenemedi' },
      { status: 500 }
    )
  }
}

// Alt ders ekle
export async function POST(
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
      weightPercentage,
      credit,
      description,
    } = data

    // Validasyon
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Alt ders adı ve kodu zorunludur' },
        { status: 400 }
      )
    }

    if (!weightPercentage) {
      return NextResponse.json(
        { error: 'Ağırlık yüzdesi zorunludur (örn: 40 = %40)' },
        { status: 400 }
      )
    }

    // Parent ders var mı kontrol et
    const parentCourse = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        subCourses: {
          where: { isDeleted: false },
          select: {
            weightPercentage: true,
          },
        },
      },
    })

    if (!parentCourse || parentCourse.isDeleted) {
      return NextResponse.json(
        { error: 'Ana ders bulunamadı' },
        { status: 404 }
      )
    }

    // Toplam ağırlık kontrolü (%100'ü geçmemeli)
    const totalWeight = parentCourse.subCourses.reduce(
      (sum, sub) => sum + (sub.weightPercentage || 0),
      0
    )

    if (totalWeight + parseFloat(weightPercentage) > 100) {
      return NextResponse.json(
        { 
          error: `Toplam ağırlık %100'ü geçemez. Mevcut: %${totalWeight}, Eklenecek: %${weightPercentage}`,
          currentTotal: totalWeight
        },
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

    // Alt dersi oluştur
    const subCourse = await prisma.course.create({
      data: {
        name: name.trim(),
        code: code.toUpperCase().trim(),
        fourMonthHours: fourMonthHours ? parseInt(fourMonthHours) : null,
        sixMonthHours: sixMonthHours ? parseInt(sixMonthHours) : null,
        credit: credit ? parseInt(credit) : null,
        description: description?.trim() || null,
        parentCourseId: params.id,
        weightPercentage: parseFloat(weightPercentage),
        // Alt ders, parent'ın özelliklerini miras alır
        requiresLab: parentCourse.requiresLab,
        programScope: parentCourse.programScope,
        courseType: 'STANDARD',
      },
    })

    return NextResponse.json({ 
      success: true, 
      subCourse,
      totalWeight: totalWeight + parseFloat(weightPercentage)
    })
  } catch (error) {
    console.error('Sub-course create error:', error)
    return NextResponse.json(
      { error: 'Alt ders oluşturulamadı' },
      { status: 500 }
    )
  }
}

