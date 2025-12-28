import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Sınıfı getir
export async function GET(
  request: Request,
  { params }: { params: { id: string; classId: string } }
) {
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: params.classId },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    })

    if (!classItem || classItem.isDeleted) {
      return NextResponse.json(
        { error: 'Sınıf bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ class: classItem })
  } catch (error) {
    console.error('Class fetch error:', error)
    return NextResponse.json(
      { error: 'Sınıf yüklenemedi' },
      { status: 500 }
    )
  }
}

// Sınıfı güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string; classId: string } }
) {
  try {
    const data = await request.json()
    const { name, capacity } = data

    // Mevcut sınıfı kontrol et
    const existingClass = await prisma.class.findUnique({
      where: { id: params.classId },
    })

    if (!existingClass || existingClass.isDeleted) {
      return NextResponse.json(
        { error: 'Sınıf bulunamadı' },
        { status: 404 }
      )
    }

    // Aynı dönemde aynı isimle başka sınıf var mı? (kendisi hariç)
    if (name && name !== existingClass.name) {
      const duplicateName = await prisma.class.findFirst({
        where: {
          termId: params.id,
          name,
          id: { not: params.classId },
          isDeleted: false,
        },
      })

      if (duplicateName) {
        return NextResponse.json(
          { error: 'Bu dönemde bu isimle bir sınıf zaten mevcut' },
          { status: 400 }
        )
      }
    }

    // Code mantığı (isim değiştiyse)
    let classCode = existingClass.code
    if (name && name !== existingClass.name) {
      if (name.toLowerCase().includes('laboratuvar') || name.toLowerCase().includes('lab')) {
        classCode = 'LAB'
      } else if (/^[A-F]\s*Sınıfı$/i.test(name.trim())) {
        classCode = name.charAt(0).toUpperCase()
      } else if (/^[A-Z]$/i.test(name.trim())) {
        classCode = name.trim().toUpperCase()
      } else {
        classCode = name.charAt(0).toUpperCase()
        
        // Çakışma kontrolü
        const existingCodeCheck = await prisma.class.findFirst({
          where: {
            termId: params.id,
            code: classCode,
            id: { not: params.classId },
            isDeleted: false,
          },
        })
        
        if (existingCodeCheck && name.length >= 3) {
          classCode = name.substring(0, 3).toUpperCase().replace(/\s/g, '')
        }
      }

      // Code çakışması kontrolü
      const duplicateCode = await prisma.class.findFirst({
        where: {
          termId: params.id,
          code: classCode,
          id: { not: params.classId },
          isDeleted: false,
        },
      })

      if (duplicateCode) {
        return NextResponse.json(
          { error: `Bu dönemde "${classCode}" kodlu bir sınıf zaten mevcut` },
          { status: 400 }
        )
      }
    }

    // Sınıfı güncelle
    const updatedClass = await prisma.class.update({
      where: { id: params.classId },
      data: {
        name: name || existingClass.name,
        code: classCode,
        capacity: capacity ? parseInt(capacity) : existingClass.capacity,
      },
    })

    return NextResponse.json({ success: true, class: updatedClass })
  } catch (error) {
    console.error('Class update error:', error)
    return NextResponse.json(
      { error: 'Sınıf güncellenemedi' },
      { status: 500 }
    )
  }
}

// Sınıfı sil (Soft Delete)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; classId: string } }
) {
  try {
    // Sınıf var mı kontrol et
    const existingClass = await prisma.class.findUnique({
      where: { id: params.classId },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    })

    if (!existingClass || existingClass.isDeleted) {
      return NextResponse.json(
        { error: 'Sınıf bulunamadı' },
        { status: 404 }
      )
    }

    // Öğrenci varsa uyarı ver (ama silmeye devam et)
    if (existingClass._count.students > 0) {
      // Soft delete yap ama uyarı döndür
      await prisma.class.update({
        where: { id: params.classId },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Sınıf silindi (öğrenciler mevcut, veriler korundu)',
        warning: 'Bu sınıfta öğrenci kayıtları mevcut',
      })
    }

    // Soft delete yap
    await prisma.class.update({
      where: { id: params.classId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Sınıf başarıyla silindi',
    })
  } catch (error) {
    console.error('Class delete error:', error)
    return NextResponse.json(
      { error: 'Sınıf silinemedi' },
      { status: 500 }
    )
  }
}

