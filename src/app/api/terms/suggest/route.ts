import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Sonraki dönem numarası önerisi getir
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const termType = searchParams.get('termType')

    if (!termType || (termType !== 'POLICE' && termType !== 'FIRE')) {
      return NextResponse.json(
        { error: 'Geçerli bir dönem tipi belirtiniz (POLICE veya FIRE)' },
        { status: 400 }
      )
    }

    // Aynı tipteki en son dönemi bul
    const lastTerm = await prisma.term.findFirst({
      where: { termType: termType as any },
      orderBy: { termNumber: 'desc' },
      select: { termNumber: true },
    })

    // Kayıt yoksa veya dönem numarası null ise öneri yapma
    if (!lastTerm || lastTerm.termNumber === null) {
      return NextResponse.json({ suggestedNumber: null })
    }

    const suggestedNumber = lastTerm.termNumber + 1

    return NextResponse.json({ suggestedNumber })
  } catch (error) {
    console.error('Suggestion error:', error)
    return NextResponse.json(
      { error: 'Öneri alınamadı' },
      { status: 500 }
    )
  }
}
