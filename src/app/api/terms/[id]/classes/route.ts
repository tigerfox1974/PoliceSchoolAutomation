import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Döneme ait sınıfları listele
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const classes = await prisma.class.findMany({
      where: { 
        termId: params.id,
        isDeleted: false, // Soft delete filtresi
      },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ classes })
  } catch (error) {
    console.error('Classes fetch error:', error)
    return NextResponse.json(
      { error: 'Sınıflar yüklenemedi' },
      { status: 500 }
    )
  }
}

// Döneme yeni sınıf ekle (DÖNEM ODAKLI MİMARİ)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { name, capacity } = data

    if (!name || !capacity) {
      return NextResponse.json(
        { error: 'Sınıf adı ve kapasite gereklidir' },
        { status: 400 }
      )
    }

    // Aynı dönemde aynı isimli sınıf var mı kontrol et
    const existingClass = await prisma.class.findFirst({
      where: {
        termId: params.id,
        name,
      },
    })

    if (existingClass) {
      return NextResponse.json(
        { error: 'Bu dönemde bu isimle bir sınıf zaten mevcut' },
        { status: 400 }
      )
    }

    // Code mantığı: Daha akıllı code üretimi
    let classCode = ''
    
    // Lab için özel
    if (name.toLowerCase().includes('laboratuvar') || name.toLowerCase().includes('lab')) {
      classCode = 'LAB'
    } 
    // "X Sınıfı" formatındaysa sadece harfi al (A, B, C, D, E, F)
    else if (/^[A-F]\s*Sınıfı$/i.test(name.trim())) {
      classCode = name.charAt(0).toUpperCase()
    }
    // İsim sadece tek harf ise (A, B, C, vb.)
    else if (/^[A-Z]$/i.test(name.trim())) {
      classCode = name.trim().toUpperCase()
    }
    // İsim "HABABAM", "A1", "AAA" gibi özel isimse
    else {
      // İlk harfi al
      classCode = name.charAt(0).toUpperCase()
      
      // Eğer çakışma varsa, ismin ilk 3 harfini kullan
      const existingCodeCheck = await prisma.class.findFirst({
        where: {
          termId: params.id,
          code: classCode,
          isDeleted: false,
        },
      })
      
      if (existingCodeCheck && name.length >= 3) {
        // İlk 3 harfi al ve büyük harfe çevir, boşlukları ve özel karakterleri kaldır
        classCode = name
          .substring(0, 3)
          .toUpperCase()
          .replace(/\s/g, '')
          .replace(/[^A-Z0-9]/g, '')
      } else if (existingCodeCheck) {
        // 3 harften azsa, ismin tamamını kullan (boşluk ve özel karakterler olmadan)
        classCode = name
          .toUpperCase()
          .replace(/\s/g, '')
          .replace(/[^A-Z0-9]/g, '')
          .substring(0, 5) // Maksimum 5 karakter
      }
    }

    // Aynı dönemde aynı code'a sahip sınıf var mı kontrol et (soft delete hariç)
    const existingCode = await prisma.class.findFirst({
      where: {
        termId: params.id,
        code: classCode,
        isDeleted: false,
      },
    })

    if (existingCode) {
      return NextResponse.json(
        { error: `Bu dönemde "${classCode}" kodlu bir sınıf zaten mevcut. Lütfen farklı bir sınıf adı kullanın.` },
        { status: 400 }
      )
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        code: classCode,
        capacity: parseInt(capacity),
        termId: params.id,
      },
    })

    return NextResponse.json({ success: true, class: newClass })
  } catch (error) {
    console.error('Class create error:', error)
    return NextResponse.json(
      { error: 'Sınıf oluşturulamadı' },
      { status: 500 }
    )
  }
}
