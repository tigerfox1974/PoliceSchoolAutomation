import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/terms/{termId}/instructor-assignments
// Dönem için ders-eğitmen atamaları listesi
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const termId = Array.isArray(params.id) ? params.id[0] : params.id

    if (!termId) {
      return NextResponse.json({ error: 'Dönem ID gerekli' }, { status: 400 })
    }

    // Dönem planındaki dersleri getir
    const termPlans = await prisma.termCoursePlan.findMany({
      where: {
        termId,
      },
      include: {
        course: {
          include: {
            courseInstructors: {
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
            },
          },
        },
      },
      orderBy: {
        course: {
          name: 'asc',
        },
      },
    })

    return NextResponse.json({
      termId,
      assignments: termPlans.map((plan) => ({
        courseId: plan.courseId,
        courseName: plan.course.name,
        courseCode: plan.course.code,
        instructors: plan.course.courseInstructors.map((ci) => ({
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
      })),
    })
  } catch (error) {
    console.error('Get instructor assignments error:', error)
    return NextResponse.json(
      { error: 'Eğitmen atamaları yüklenemedi', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    )
  }
}

