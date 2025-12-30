import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/courses/{courseId}/instructors/{instructorId}
// Atamayı kaldır
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; instructorId: string } }
) {
  try {
    const courseId = Array.isArray(params.id) ? params.id[0] : params.id
    const instructorId = Array.isArray(params.instructorId) ? params.instructorId[0] : params.instructorId

    if (!courseId || !instructorId) {
      return NextResponse.json({ error: 'Ders ID ve Eğitmen ID gerekli' }, { status: 400 })
    }

    // Atama var mı kontrol et
    const assignment = await prisma.courseInstructor.findUnique({
      where: {
        courseId_instructorId: {
          courseId,
          instructorId,
        },
      },
      include: {
        instructor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!assignment) {
      return NextResponse.json({ error: 'Atama bulunamadı' }, { status: 404 })
    }

    // Atamayı sil
    await prisma.courseInstructor.delete({
      where: {
        courseId_instructorId: {
          courseId,
          instructorId,
        },
      },
    })

    return NextResponse.json({
      message: `Eğitmen ${assignment.instructor.firstName} ${assignment.instructor.lastName} başarıyla kaldırıldı`,
    })
  } catch (error) {
    console.error('Remove instructor assignment error:', error)
    return NextResponse.json(
      { error: 'Atama kaldırılamadı', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    )
  }
}

