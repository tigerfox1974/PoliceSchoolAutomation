import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Belirli bir dönemi getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const term = await prisma.term.findUnique({
      where: { id: params.id },
      include: {
        students: {
          include: {
            class: true,
            dormitory: true,
          },
        },
        classes: true,
        instructorTerms: {
          include: {
            instructor: true,
          },
        },
        _count: {
          select: {
            students: true,
            classes: true,
            courses: true,
          },
        },
      },
    })

    if (!term) {
      return NextResponse.json(
        { error: 'Dönem bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ term })
  } catch (error) {
    console.error('Term fetch error:', error)
    return NextResponse.json(
      { error: 'Dönem yüklenemedi' },
      { status: 500 }
    )
  }
}

// Dönemi güncelle
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()

    const term = await prisma.term.update({
      where: { id: params.id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    })

    return NextResponse.json({ success: true, term })
  } catch (error) {
    console.error('Term update error:', error)
    return NextResponse.json(
      { error: 'Dönem güncellenemedi' },
      { status: 500 }
    )
  }
}

// Dönemi sil
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.term.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Term delete error:', error)
    return NextResponse.json(
      { error: 'Dönem silinemedi' },
      { status: 500 }
    )
  }
}
