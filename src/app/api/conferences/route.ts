import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Tüm konferansları listele
export async function GET() {
  try {
    const conferences = await prisma.conference.findMany({
      include: {
        externalSpeaker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            title: true,
            organization: true,
          },
        },
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
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
        description,
        externalSpeakerId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        duration: duration || 2,
        startSlot: startSlot ? parseInt(startSlot) : null,
        endSlot: endSlot ? parseInt(endSlot) : null,
        targetClasses: targetClasses || [],
        isAllClasses: isAllClasses ?? false,
        requiresSpecialRoom: requiresSpecialRoom ?? false,
        specialRoomType,
        requiredEquipment: requiredEquipment || [],
        countsTowardCurriculum: countsTowardCurriculum ?? false,
        courseId,
        status: status || 'PLANNED',
        organizerId,
        notes,
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

