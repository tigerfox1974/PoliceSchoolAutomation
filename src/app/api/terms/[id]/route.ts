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
        classes: {
          include: {
            _count: {
              select: {
                students: true,
              },
            },
          },
        },
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

    // Dönem kodu ve adını otomatik oluştur
    let termCode = data.termCode
    let name = data.name

    if (data.termNumber && data.termType) {
      const typePrefix = data.termType === 'POLICE' ? 'PTE' : 'İTE'
      const paddedNumber = String(data.termNumber).padStart(2, '0')
      termCode = `${typePrefix}-${paddedNumber}`

      const typeName = data.termType === 'POLICE' ? 'Polis Temel Eğitimi' : 'İtfaiye Temel Eğitimi'
      name = `${data.termNumber}. ${typeName}`
    }

    const term = await prisma.term.update({
      where: { id: params.id },
      data: {
        termNumber: data.termNumber,
        termType: data.termType,
        termCode,
        name,
        duration: data.duration,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        status: data.status,
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

// Dönemi sil (Soft Delete)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Soft delete kullan (isDeleted = true)
    await prisma.term.update({
      where: { id: params.id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
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
