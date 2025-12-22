import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Tüm dönemleri listele
export async function GET() {
  try {
    const terms = await prisma.term.findMany({
      include: {
        _count: {
          select: {
            students: true,
            classes: true,
            instructorTerms: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    })

    return NextResponse.json({ terms })
  } catch (error) {
    console.error('Terms fetch error:', error)
    return NextResponse.json(
      { error: 'Dönemler yüklenemedi' },
      { status: 500 }
    )
  }
}

// Yeni dönem oluştur
export async function POST(request: Request) {
  try {
    const data = await request.json()

    const { termNumber, termType, duration, startDate, endDate } = data

    if (!termNumber || !termType || !duration || !startDate) {
      return NextResponse.json(
        { error: 'Tüm zorunlu alanlar doldurulmalıdır' },
        { status: 400 }
      )
    }

    // Dönem adını otomatik oluştur
    const termTypeName = termType === 'POLICE' ? 'Polis Temel Eğitimi' : 'İtfaiye Temel Eğitimi'
    const name = `${termNumber}. ${termTypeName}`

    // Dönem kodunu otomatik oluştur (PTE-68 veya İTE-18)
    const termCode = `${termType === 'POLICE' ? 'PTE' : 'İTE'}-${String(termNumber).padStart(2, '0')}`

    // Bitiş tarihini hesapla (eğer girilmemişse)
    let calculatedEndDate = endDate ? new Date(endDate) : null
    
    if (!calculatedEndDate) {
      const start = new Date(startDate)
      calculatedEndDate = new Date(start)
      
      // Süreye göre bitiş tarihi hesapla
      if (duration === 'FOUR_MONTHS') {
        calculatedEndDate.setMonth(calculatedEndDate.getMonth() + 4)
      } else if (duration === 'SIX_MONTHS') {
        calculatedEndDate.setMonth(calculatedEndDate.getMonth() + 6)
      }
    }

    const term = await prisma.term.create({
      data: {
        termNumber: parseInt(termNumber),
        name,
        termCode,
        termType,
        duration,
        startDate: new Date(startDate),
        endDate: calculatedEndDate,
        isActive: data.isActive ?? false,
        description: data.description,
      },
    })

    return NextResponse.json({ success: true, term })
  } catch (error) {
    console.error('Term create error:', error)
    return NextResponse.json(
      { error: 'Dönem oluşturulamadı' },
      { status: 500 }
    )
  }
}
