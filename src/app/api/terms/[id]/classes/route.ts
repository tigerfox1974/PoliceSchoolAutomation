import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Döneme ait sınıfları listele
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const classes = await prisma.class.findMany({
      where: { termId: params.id },
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

    const newClass = await prisma.class.create({
      data: {
        name,
        code: name.charAt(0).toUpperCase(),
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
