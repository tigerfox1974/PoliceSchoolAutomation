import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Belirli bir konferansı getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conference = await prisma.conference.findUnique({
      where: { id: params.id },
      include: {
        externalSpeaker: true,
        course: true,
        _count: {
          select: {
            dailyLessons: true,
          },
        },
      },
    })

    if (!conference) {
      return NextResponse.json(
        { error: 'Konferans bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ conference })
  } catch (error) {
    console.error('Conference fetch error:', error)
    return NextResponse.json(
      { error: 'Konferans yüklenemedi' },
      { status: 500 }
    )
  }
}

// Konferansı güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    const conference = await prisma.conference.update({
      where: { id: params.id },
      data: {
        conferenceTitle: data.conferenceTitle,
        topic: data.topic,
        description: data.description || null,
        externalSpeakerId: data.externalSpeakerId || null,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
        duration: data.duration || 2,
        startSlot: data.startSlot ? parseInt(data.startSlot) : null,
        endSlot: data.endSlot ? parseInt(data.endSlot) : null,
        targetClasses: data.targetClasses || null,
        isAllClasses: data.isAllClasses || false,
        requiresSpecialRoom: data.requiresSpecialRoom || false,
        specialRoomType: data.specialRoomType || null,
        requiredEquipment: data.requiredEquipment || null,
        countsTowardCurriculum: data.countsTowardCurriculum || false,
        courseId: data.courseId || null,
        status: data.status || 'PLANNED',
        organizerId: data.organizerId || null,
        notes: data.notes || null,
      },
    })

    return NextResponse.json({ success: true, conference })
  } catch (error) {
    console.error('Conference update error:', error)
    return NextResponse.json(
      { error: 'Konferans güncellenemedi' },
      { status: 500 }
    )
  }
}

// Konferansı sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Önce konferansın kullanılıp kullanılmadığını kontrol et
    const dailyLessonsCount = await prisma.dailyLesson.count({
      where: {
        conferenceId: params.id,
      },
    })

    if (dailyLessonsCount > 0) {
      return NextResponse.json(
        {
          error: `Bu konferans ${dailyLessonsCount} günlük ders kaydında kullanılıyor. Önce bu kayıtları güncelleyin.`,
        },
        { status: 400 }
      )
    }

    await prisma.conference.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Conference delete error:', error)
    return NextResponse.json(
      { error: 'Konferans silinemedi' },
      { status: 500 }
    )
  }
}
