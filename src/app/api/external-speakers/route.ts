import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Tüm dıştan gelen eğitmenleri listele
export async function GET() {
  try {
    const externalSpeakers = await prisma.externalSpeaker.findMany({
      include: {
        _count: {
          select: {
            conferences: true,
          },
        },
      },
      orderBy: {
        lastName: 'asc',
      },
    })

    return NextResponse.json({ externalSpeakers })
  } catch (error) {
    console.error('External speakers fetch error:', error)
    return NextResponse.json(
      { error: 'Dıştan gelen eğitmenler yüklenemedi' },
      { status: 500 }
    )
  }
}

// Yeni dıştan gelen eğitmen oluştur
export async function POST(request: Request) {
  try {
    const data = await request.json()

    const {
      firstName,
      lastName,
      title,
      organization,
      department,
      email,
      phone,
      address,
      expertise,
      bio,
      isActive,
      notes,
    } = data

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'Ad ve soyad zorunludur' },
        { status: 400 }
      )
    }

    // Email varsa unique kontrolü
    if (email) {
      const existingSpeaker = await prisma.externalSpeaker.findUnique({
        where: { email },
      })

      if (existingSpeaker) {
        return NextResponse.json(
          { error: 'Bu email adresi zaten kayıtlı' },
          { status: 400 }
        )
      }
    }

    const externalSpeaker = await prisma.externalSpeaker.create({
      data: {
        firstName,
        lastName,
        title,
        organization,
        department,
        email,
        phone,
        address,
        expertise: expertise || null,
        bio,
        isActive: isActive ?? true,
        notes,
      },
    })

    return NextResponse.json({ success: true, externalSpeaker })
  } catch (error) {
    console.error('External speaker create error:', error)
    return NextResponse.json(
      { error: 'Dıştan gelen eğitmen oluşturulamadı' },
      { status: 500 }
    )
  }
}

