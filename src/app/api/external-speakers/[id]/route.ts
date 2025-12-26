import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Belirli bir dış konuşmacıyı getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const externalSpeaker = await prisma.externalSpeaker.findUnique({
      where: { id: params.id },
      include: {
        conferences: {
          include: {
            course: true,
          },
        },
        _count: {
          select: {
            conferences: true,
          },
        },
      },
    })

    if (!externalSpeaker) {
      return NextResponse.json(
        { error: 'Dış konuşmacı bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ externalSpeaker })
  } catch (error) {
    console.error('External speaker fetch error:', error)
    return NextResponse.json(
      { error: 'Dış konuşmacı yüklenemedi' },
      { status: 500 }
    )
  }
}

// Dış konuşmacıyı güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    // Email unique kontrolü (eğer değiştiriliyorsa)
    if (data.email) {
      const existing = await prisma.externalSpeaker.findFirst({
        where: {
          email: data.email,
          id: { not: params.id },
        },
      })
      if (existing) {
        return NextResponse.json(
          { error: 'Bu e-posta adresi başka bir konuşmacı tarafından kullanılıyor' },
          { status: 400 }
        )
      }
    }

    const externalSpeaker = await prisma.externalSpeaker.update({
      where: { id: params.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        title: data.title || null,
        organization: data.organization || null,
        department: data.department || null,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        expertise: data.expertise || null,
        bio: data.bio || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
        notes: data.notes || null,
      },
    })

    return NextResponse.json({ success: true, externalSpeaker })
  } catch (error) {
    console.error('External speaker update error:', error)
    return NextResponse.json(
      { error: 'Dış konuşmacı güncellenemedi' },
      { status: 500 }
    )
  }
}

// Dış konuşmacıyı sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Önce konuşmacının konferanslarını kontrol et
    const conferencesCount = await prisma.conference.count({
      where: {
        externalSpeakerId: params.id,
      },
    })

    if (conferencesCount > 0) {
      return NextResponse.json(
        {
          error: `Bu konuşmacı ${conferencesCount} konferansta kullanılıyor. Önce bu konferansları güncelleyin.`,
        },
        { status: 400 }
      )
    }

    await prisma.externalSpeaker.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('External speaker delete error:', error)
    return NextResponse.json(
      { error: 'Dış konuşmacı silinemedi' },
      { status: 500 }
    )
  }
}
