import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Dersin eğitmenlerini listele
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const courseInstructors = await prisma.courseInstructor.findMany({
      where: {
        courseId: params.id,
      },
      include: {
        instructor: true,
      },
      orderBy: {
        assignedAt: 'asc',
      },
    })

    return NextResponse.json({ courseInstructors })
  } catch (error) {
    console.error('Course instructors fetch error:', error)
    return NextResponse.json(
      { error: 'Eğitmenler yüklenemedi' },
      { status: 500 }
    )
  }
}

// Derse eğitmen ata
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const { instructorId } = data

    if (!instructorId) {
      return NextResponse.json(
        { error: 'Eğitmen ID gereklidir' },
        { status: 400 }
      )
    }

    // Zaten atanmış mı kontrol et
    const existing = await prisma.courseInstructor.findUnique({
      where: {
        courseId_instructorId: {
          courseId: params.id,
          instructorId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Bu eğitmen zaten bu derse atanmış' },
        { status: 400 }
      )
    }

    const courseInstructor = await prisma.courseInstructor.create({
      data: {
        courseId: params.id,
        instructorId,
      },
      include: {
        instructor: true,
        course: true,
      },
    })

    return NextResponse.json({ success: true, courseInstructor })
  } catch (error) {
    console.error('Course instructor assign error:', error)
    return NextResponse.json(
      { error: 'Eğitmen atanamadı' },
      { status: 500 }
    )
  }
}

