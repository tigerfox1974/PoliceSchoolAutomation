import { NextResponse } from 'next/server'
import { generateAllWeeks, generateSingleWeek } from '@/app/api/terms/[id]/weekly-schedule/route'

// POST /api/weekly-schedule-generate
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { termId, weekNumber, generateAll, skipExtensionCheck } = body || {}

    if (!termId) {
      return NextResponse.json({ error: 'Dönem ID gereklidir' }, { status: 400 })
    }

    if (generateAll) {
      return await generateAllWeeks(termId, { skipExtensionCheck })
    }

    if (!weekNumber) {
      return NextResponse.json({ error: 'weekNumber gerekli' }, { status: 400 })
    }

    const result = await generateSingleWeek(termId, weekNumber)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Weekly schedule generate error:', error)
    return NextResponse.json(
      { error: 'Program oluşturulamadı', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    )
  }
}
