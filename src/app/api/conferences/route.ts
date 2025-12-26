import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Tüm konferansları listele
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const scheduledDate = searchParams.get('scheduledDate')

    const where: any = {}
    if (status) {
      where.status = status
    }
    if (scheduledDate) {
      where.scheduledDate = new Date(scheduledDate)
    }

    const conferences = await prisma.conference.findMany({
      where,
      include: {
        externalSpeaker: true,
        course: true,
        _count: {
          select: {
            dailyLessons: true,
          },
        },
      },
      orderBy: {
        scheduledDate: 'desc',
      },
    })

    return NextResponse.json({ conferences })
  } catch (error) {
    console.error('Conferences fetch error:', error)
    return NextResponse.json(
      { error: 'Konferanslar yüklenemedi' },
      { status: 500 }
    )
  }
}

// Yeni konferans oluştur
export async function POST(request: Request) {
  try {
    const data = await request.json()

    const {
      conferenceTitle,
      topic,
      description,
      externalSpeakerId,
      scheduledDate,
      duration,
      startSlot,
      endSlot,
      targetClasses,
      isAllClasses,
      requiresSpecialRoom,
      specialRoomType,
      requiredEquipment,
      countsTowardCurriculum,
      courseId,
      status,
      organizerId,
      notes,
    } = data

    if (!conferenceTitle || !topic) {
      return NextResponse.json(
        { error: 'Konferans başlığı ve konu zorunludur' },
        { status: 400 }
      )
    }

    const conference = await prisma.conference.create({
      data: {
        conferenceTitle,
        topic,
        description: description || null,
        externalSpeakerId: externalSpeakerId || null,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        duration: duration || 2,
        startSlot: startSlot ? parseInt(startSlot) : null,
        endSlot: endSlot ? parseInt(endSlot) : null,
        targetClasses: targetClasses || null,
        isAllClasses: isAllClasses || false,
        requiresSpecialRoom: requiresSpecialRoom || false,
        specialRoomType: specialRoomType || null,
        requiredEquipment: requiredEquipment || null,
        countsTowardCurriculum: countsTowardCurriculum || false,
        courseId: courseId || null,
        status: status || 'PLANNED',
        organizerId: organizerId || null,
        notes: notes || null,
      },
    })

    return NextResponse.json({ success: true, conference })
  } catch (error) {
    console.error('Conference create error:', error)
    return NextResponse.json(
      { error: 'Konferans oluşturulamadı' },
      { status: 500 }
    )
  }
}
