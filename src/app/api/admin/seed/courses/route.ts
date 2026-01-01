import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getStandardCoursesForTermType } from '@/lib/seed/standardCourses'

export async function POST(request: Request) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Bu islem production ortaminda kapali' }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const termType = body?.termType as 'POLICE' | 'FIRE' | undefined

    if (!termType || (termType !== 'POLICE' && termType !== 'FIRE')) {
      return NextResponse.json({ error: 'termType gerekli (POLICE | FIRE)' }, { status: 400 })
    }

    const seeds = getStandardCoursesForTermType(termType)

    const results = await Promise.all(
      seeds.map((c) =>
        prisma.course.upsert({
          where: { code: c.code },
          update: {
            name: c.name,
            fourMonthHours: c.fourMonthHours,
            sixMonthHours: c.sixMonthHours,
            requiresLab: c.requiresLab,
            programScope: c.programScope,
            courseType: c.courseType ?? 'STANDARD',
            isDeleted: false,
            deletedAt: null,
          },
          create: {
            name: c.name,
            code: c.code,
            fourMonthHours: c.fourMonthHours,
            sixMonthHours: c.sixMonthHours,
            requiresLab: c.requiresLab,
            programScope: c.programScope,
            courseType: c.courseType ?? 'STANDARD',
          },
          select: { id: true, code: true },
        })
      )
    )

    return NextResponse.json({
      success: true,
      upserted: results.length,
      message: `${results.length} ders katalog kaydi yuklendi`,
    })
  } catch (error) {
    console.error('Seed courses error:', error)
    return NextResponse.json(
      { error: 'Ders katalogu yuklenemedi', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    )
  }
}
