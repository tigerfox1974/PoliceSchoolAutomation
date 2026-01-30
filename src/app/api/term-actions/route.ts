import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/term-actions
// action: 'update' | 'status' | 'delete'
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { action, id } = data

    if (!id) {
      return NextResponse.json({ error: 'Dönem ID zorunludur' }, { status: 400 })
    }

    if (action === 'delete') {
      await prisma.term.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      })

      return NextResponse.json({ success: true })
    }

    if (action === 'status') {
      const { status } = data
      if (!status) {
        return NextResponse.json({ error: 'Durum zorunludur' }, { status: 400 })
      }

      const term = await prisma.term.update({
        where: { id },
        data: { status },
      })

      return NextResponse.json({ success: true, term })
    }

    if (action === 'update') {
      const { termNumber, termType, duration, startDate, endDate, status } = data

      let termCode = undefined
      let name = undefined

      if (termNumber && termType) {
        const typePrefix = termType === 'POLICE' ? 'PTE' : 'İTE'
        const paddedNumber = String(termNumber).padStart(2, '0')
        termCode = `${typePrefix}-${paddedNumber}`

        const typeName = termType === 'POLICE' ? 'Polis Temel Eğitimi' : 'İtfaiye Temel Eğitimi'
        name = `${termNumber}. ${typeName}`
      }

      const term = await prisma.term.update({
        where: { id },
        data: {
          termNumber,
          termType,
          termCode,
          name,
          duration,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
          status,
        },
      })

      return NextResponse.json({ success: true, term })
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 })
  } catch (error) {
    console.error('Term action error:', error)
    return NextResponse.json(
      { error: 'İşlem gerçekleştirilemedi' },
      { status: 500 }
    )
  }
}
