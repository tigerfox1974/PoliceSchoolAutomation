import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Tüm dış konuşmacıları listele
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('isActive')
    const organization = searchParams.get('organization')

    const where: any = {}
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }
    if (organization) {
      where.organization = {
        contains: organization,
        mode: 'insensitive',
      }
    }

    const externalSpeakers = await prisma.externalSpeaker.findMany({
      where,
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
      { error: 'Dış konuşmacılar yüklenemedi' },
      { status: 500 }
    )
  }
}

// Yeni dış konuşmacı oluştur
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

    // Email unique kontrolü
    if (email) {
      const existing = await prisma.externalSpeaker.findUnique({
        where: { email },
      })
      if (existing) {
        return NextResponse.json(
          { error: 'Bu e-posta adresi zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }

    const externalSpeaker = await prisma.externalSpeaker.create({
      data: {
        firstName,
        lastName,
        title: title || null,
        organization: organization || null,
        department: department || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        expertise: expertise || null,
        bio: bio || null,
        isActive: isActive !== undefined ? isActive : true,
        notes: notes || null,
      },
    })

    return NextResponse.json({ success: true, externalSpeaker })
  } catch (error) {
    console.error('External speaker create error:', error)
    return NextResponse.json(
      { error: 'Dış konuşmacı oluşturulamadı' },
      { status: 500 }
    )
  }
}
