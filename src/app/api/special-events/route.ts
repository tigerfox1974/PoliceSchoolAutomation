import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Tüm özel etkinlikleri listele
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventType = searchParams.get('eventType')
    const dayOfWeek = searchParams.get('dayOfWeek')

    const where: any = {}
    if (eventType) {
      where.eventType = eventType
    }
    if (dayOfWeek) {
      where.dayOfWeek = parseInt(dayOfWeek)
    }

    const specialEvents = await prisma.specialEvent.findMany({
      where,
      include: {
        _count: {
          select: {
            dailyLessons: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ specialEvents })
  } catch (error) {
    console.error('Special events fetch error:', error)
    return NextResponse.json(
      { error: 'Özel etkinlikler yüklenemedi' },
      { status: 500 }
    )
  }
}

// Yeni özel etkinlik oluştur
export async function POST(request: Request) {
  try {
    const data = await request.json()

    const {
      eventType,
      eventTitle,
      description,
      duration,
      dayOfWeek,
      slotIndex,
      requiresInstructor,
      allClassesTogether,
      countsTowardCurriculum,
      managedBy,
      notes,
    } = data

    if (!eventType || !eventTitle) {
      return NextResponse.json(
        { error: 'Etkinlik tipi ve başlık zorunludur' },
        { status: 400 }
      )
    }

    const specialEvent = await prisma.specialEvent.create({
      data: {
        eventType,
        eventTitle,
        description: description || null,
        duration: duration || 1,
        dayOfWeek: dayOfWeek ? parseInt(dayOfWeek) : null,
        slotIndex: slotIndex ? parseInt(slotIndex) : null,
        requiresInstructor: requiresInstructor || false,
        allClassesTogether: allClassesTogether || false,
        countsTowardCurriculum: countsTowardCurriculum || false,
        managedBy: managedBy || null,
        notes: notes || null,
      },
    })

    return NextResponse.json({ success: true, specialEvent })
  } catch (error) {
    console.error('Special event create error:', error)
    return NextResponse.json(
      { error: 'Özel etkinlik oluşturulamadı' },
      { status: 500 }
    )
  }
}
