import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Tüm eğitmenleri listele
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const instructorType = searchParams.get('type') // CADRE, EXTERNAL

    const where: any = {
      isDeleted: false, // Silinmiş eğitmenleri gösterme
    }

    if (instructorType) {
      where.instructorType = instructorType
    }

    const instructors = await prisma.instructor.findMany({
      where,
      include: {
        courseInstructors: {
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
        _count: {
          select: {
            courseInstructors: true,
            dailyLessons: true,
          },
        },
      },
      orderBy: {
        lastName: 'asc',
      },
    })

    return NextResponse.json({ instructors })
  } catch (error) {
    console.error('Instructors fetch error:', error)
    return NextResponse.json(
      { error: 'Eğitmenler yüklenemedi' },
      { status: 500 }
    )
  }
}

// Yeni eğitmen oluştur
export async function POST(request: Request) {
  try {
    const data = await request.json()

    const {
      tcKimlikNo,
      firstName,
      lastName,
      email,
      phone,
      instructorType,
      rank,
      badgeNumber,
      institution,
      branch,
    } = data

    // Validasyon
    if (!tcKimlikNo || !firstName || !lastName || !instructorType) {
      return NextResponse.json(
        { error: 'KKTC Kimlik No, ad, soyad ve eğitmen tipi zorunludur' },
        { status: 400 }
      )
    }

    // KKTC Kimlik No 10 hane kontrolü
    if (tcKimlikNo.length !== 10 || !/^\d{10}$/.test(tcKimlikNo)) {
      return NextResponse.json(
        { error: 'KKTC Kimlik No 10 haneli olmalıdır' },
        { status: 400 }
      )
    }

    // KKTC Kimlik No unique kontrolü
    const existing = await prisma.instructor.findUnique({
      where: { tcKimlikNo },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Bu KKTC Kimlik No ile kayıtlı eğitmen var' },
        { status: 400 }
      )
    }

    // Email varsa unique kontrolü
    if (email) {
      const existingEmail = await prisma.instructor.findFirst({
        where: { 
          email,
          isDeleted: false,
        },
      })

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Bu email adresi başka bir eğitmen tarafından kullanılıyor' },
          { status: 400 }
        )
      }
    }

    const instructor = await prisma.instructor.create({
      data: {
        tcKimlikNo,
        firstName,
        lastName,
        email,
        phone,
        instructorType,
        rank,
        badgeNumber,
        institution,
        branch,
        isActive: true,
      },
    })

    return NextResponse.json({ success: true, instructor })
  } catch (error) {
    console.error('Instructor create error:', error)
    return NextResponse.json(
      { error: 'Eğitmen oluşturulamadı' },
      { status: 500 }
    )
  }
}

