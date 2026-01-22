import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/term-settings - Dönem ayarlarını oluştur/güncelle (upsert)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const termId = body?.termId

    if (!termId) {
      return NextResponse.json(
        { error: 'Dönem ID gereklidir' },
        { status: 400 }
      )
    }

    // Dönem var mı kontrol et
    const term = await prisma.term.findUnique({
      where: { id: termId, isDeleted: false },
    })

    if (!term) {
      return NextResponse.json(
        { error: 'Dönem bulunamadı' },
        { status: 404 }
      )
    }

    const settings = await prisma.termSettings.upsert({
      where: { termId },
      create: {
        termId,
        firstLessonStart: body.firstLessonStart || '08:00',
        lessonDuration: body.lessonDuration || 45,
        breakDuration: body.breakDuration || 15,
        lunchBreakStart: body.lunchBreakStart || '12:45',
        lunchBreakDuration: body.lunchBreakDuration || 60,
        hasStudyHall: body.hasStudyHall || false,
        studyHallStart: body.hasStudyHall ? body.studyHallStart : null,
        studyHallDuration: body.hasStudyHall ? body.studyHallDuration : null,
        workingDays: body.workingDays || [
          'MONDAY',
          'TUESDAY',
          'WEDNESDAY',
          'THURSDAY',
          'FRIDAY',
        ],
        examWeeks: body.examWeeks || [],
      },
      update: {
        firstLessonStart: body.firstLessonStart ?? '08:00',
        lessonDuration: body.lessonDuration ?? 45,
        breakDuration: body.breakDuration ?? 15,
        lunchBreakStart: body.lunchBreakStart ?? '12:45',
        lunchBreakDuration: body.lunchBreakDuration ?? 60,
        hasStudyHall: body.hasStudyHall ?? false,
        studyHallStart: body.hasStudyHall ? (body.studyHallStart ?? null) : null,
        studyHallDuration: body.hasStudyHall ? (body.studyHallDuration ?? null) : null,
        workingDays: body.workingDays ?? [
          'MONDAY',
          'TUESDAY',
          'WEDNESDAY',
          'THURSDAY',
          'FRIDAY',
        ],
        examWeeks: body.examWeeks ?? [],
      },
    })

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Term settings upsert error:', error)
    return NextResponse.json(
      { error: 'Ayarlar kaydedilemedi' },
      { status: 500 }
    )
  }
}
