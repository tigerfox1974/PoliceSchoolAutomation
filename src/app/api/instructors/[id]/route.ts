import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Eğitmen detayı
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const instructor = await prisma.instructor.findUnique({
      where: {
        id: params.id,
        isDeleted: false,
      },
      include: {
        courseInstructors: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        _count: {
          select: {
            dailyLessons: true,
            instructorTerms: true,
          },
        },
      },
    })

    if (!instructor) {
      return NextResponse.json(
        { error: 'Eğitmen bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ instructor })
  } catch (error) {
    console.error('Instructor fetch error:', error)
    return NextResponse.json(
      { error: 'Eğitmen bilgisi yüklenemedi' },
      { status: 500 }
    )
  }
}

// Eğitmen güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    const instructor = await prisma.instructor.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json({ success: true, instructor })
  } catch (error) {
    console.error('Instructor update error:', error)
    return NextResponse.json(
      { error: 'Eğitmen güncellenemedi' },
      { status: 500 }
    )
  }
}

// Eğitmen sil (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.instructor.update({
      where: { id: params.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Instructor delete error:', error)
    return NextResponse.json(
      { error: 'Eğitmen silinemedi' },
      { status: 500 }
    )
  }
}

