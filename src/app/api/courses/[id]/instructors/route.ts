import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/courses/{courseId}/instructors
// Bir dersin eğitmenleri
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = Array.isArray(params.id) ? params.id[0] : params.id

    if (!courseId) {
      return NextResponse.json({ error: 'Ders ID gerekli' }, { status: 400 })
    }

    const courseInstructors = await prisma.courseInstructor.findMany({
      where: {
        courseId,
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rank: true,
            branch: true,
            instructorType: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    })

    return NextResponse.json({
      courseId,
      instructors: courseInstructors.map((ci) => ({
        id: ci.instructor.id,
        firstName: ci.instructor.firstName,
        lastName: ci.instructor.lastName,
        fullName: `${ci.instructor.firstName} ${ci.instructor.lastName}`,
        rank: ci.instructor.rank,
        branch: ci.instructor.branch,
        instructorType: ci.instructor.instructorType,
        assignedAt: ci.assignedAt,
        hoursAssigned: ci.hoursAssigned,
      })),
    })
  } catch (error) {
    console.error('Get course instructors error:', error)
    return NextResponse.json(
      { error: 'Eğitmenler yüklenemedi', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    )
  }
}

// POST /api/courses/{courseId}/instructors
// Derse eğitmen ata
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = Array.isArray(params.id) ? params.id[0] : params.id

    if (!courseId) {
      return NextResponse.json({ error: 'Ders ID gerekli' }, { status: 400 })
    }

    const body = await request.json()
    const { instructorId, hoursAssigned } = body

    if (!instructorId) {
      return NextResponse.json({ error: 'Eğitmen ID gerekli' }, { status: 400 })
    }

    // Ders var mı kontrol et
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json({ error: 'Ders bulunamadı' }, { status: 404 })
    }

    // Eğitmen var mı kontrol et
    const instructor = await prisma.instructor.findUnique({
      where: { id: instructorId },
    })

    if (!instructor) {
      return NextResponse.json({ error: 'Eğitmen bulunamadı' }, { status: 404 })
    }

    // Zaten atanmış mı kontrol et
    const existing = await prisma.courseInstructor.findUnique({
      where: {
        courseId_instructorId: {
          courseId,
          instructorId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: 'Bu eğitmen zaten bu derse atanmış' }, { status: 400 })
    }

    // Atama yap
    const assignment = await prisma.courseInstructor.create({
      data: {
        courseId,
        instructorId,
        hoursAssigned: hoursAssigned ? parseInt(hoursAssigned) : null,
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rank: true,
            branch: true,
            instructorType: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: 'Eğitmen başarıyla atandı',
      assignment: {
        id: assignment.id,
        courseId: assignment.courseId,
        instructor: {
          id: assignment.instructor.id,
          firstName: assignment.instructor.firstName,
          lastName: assignment.instructor.lastName,
          fullName: `${assignment.instructor.firstName} ${assignment.instructor.lastName}`,
          rank: assignment.instructor.rank,
          branch: assignment.instructor.branch,
          instructorType: assignment.instructor.instructorType,
        },
        assignedAt: assignment.assignedAt,
        hoursAssigned: assignment.hoursAssigned,
      },
    })
  } catch (error) {
    console.error('Assign instructor error:', error)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Bu eğitmen zaten bu derse atanmış' }, { status: 400 })
    }
    return NextResponse.json(
      { error: 'Eğitmen atanamadı', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    )
  }
}
