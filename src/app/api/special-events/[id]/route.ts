import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Belirli bir özel etkinliği getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const specialEvent = await prisma.specialEvent.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            dailyLessons: true,
          },
        },
      },
    })

    if (!specialEvent) {
      return NextResponse.json(
        { error: 'Özel etkinlik bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ specialEvent })
  } catch (error) {
    console.error('Special event fetch error:', error)
    return NextResponse.json(
      { error: 'Özel etkinlik yüklenemedi' },
      { status: 500 }
    )
  }
}

// Özel etkinliği güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    const specialEvent = await prisma.specialEvent.update({
      where: { id: params.id },
      data: {
        eventType: data.eventType,
        eventTitle: data.eventTitle,
        description: data.description || null,
        duration: data.duration || 1,
        dayOfWeek: data.dayOfWeek ? parseInt(data.dayOfWeek) : null,
        slotIndex: data.slotIndex ? parseInt(data.slotIndex) : null,
        requiresInstructor: data.requiresInstructor || false,
        allClassesTogether: data.allClassesTogether || false,
        countsTowardCurriculum: data.countsTowardCurriculum || false,
        managedBy: data.managedBy || null,
        notes: data.notes || null,
      },
    })

    return NextResponse.json({ success: true, specialEvent })
  } catch (error) {
    console.error('Special event update error:', error)
    return NextResponse.json(
      { error: 'Özel etkinlik güncellenemedi' },
      { status: 500 }
    )
  }
}

// Özel etkinliği sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Önce etkinliğin kullanılıp kullanılmadığını kontrol et
    const dailyLessonsCount = await prisma.dailyLesson.count({
      where: {
        specialEventId: params.id,
      },
    })

    if (dailyLessonsCount > 0) {
      return NextResponse.json(
        {
          error: `Bu etkinlik ${dailyLessonsCount} günlük ders kaydında kullanılıyor. Önce bu kayıtları güncelleyin.`,
        },
        { status: 400 }
      )
    }

    await prisma.specialEvent.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Special event delete error:', error)
    return NextResponse.json(
      { error: 'Özel etkinlik silinemedi' },
      { status: 500 }
    )
  }
}
