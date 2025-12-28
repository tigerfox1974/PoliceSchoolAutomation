import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/terms/{termId}/settings - Dönem ayarlarını getir
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const termId = params.id

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

    // Ayarları getir
    const settings = await prisma.termSettings.findUnique({
      where: { termId },
    })

    // Ayarlar yoksa varsayılan değerleri döndür
    if (!settings) {
      return NextResponse.json({
        termId,
        firstLessonStart: '08:00',
        lessonDuration: 45,
        breakDuration: 15,
        lunchBreakStart: '12:45',
        lunchBreakDuration: 60,
        hasStudyHall: false,
        studyHallStart: null,
        studyHallDuration: null,
        workingDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
        examWeeks: [],
        isDefault: true,
      })
    }

    return NextResponse.json({
      ...settings,
      isDefault: false,
    })
  } catch (error) {
    console.error('Term settings GET error:', error)
    return NextResponse.json(
      { error: 'Ayarlar getirilemedi' },
      { status: 500 }
    )
  }
}

// POST /api/terms/{termId}/settings - Dönem ayarlarını oluştur
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const termId = params.id
    const body = await request.json()

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

    // Mevcut ayarları kontrol et
    const existing = await prisma.termSettings.findUnique({
      where: { termId },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ayarlar zaten mevcut. PUT kullanın.' },
        { status: 400 }
      )
    }

    // Yeni ayarları oluştur
    const settings = await prisma.termSettings.create({
      data: {
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
    })

    return NextResponse.json({ success: true, settings }, { status: 201 })
  } catch (error) {
    console.error('Term settings POST error:', error)
    return NextResponse.json(
      { error: 'Ayarlar oluşturulamadı' },
      { status: 500 }
    )
  }
}

// PUT /api/terms/{termId}/settings - Dönem ayarlarını güncelle
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const termId = params.id
    const body = await request.json()

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

    // Mevcut ayarları kontrol et
    const existing = await prisma.termSettings.findUnique({
      where: { termId },
    })

    if (!existing) {
      // Ayarlar yoksa oluştur
      const settings = await prisma.termSettings.create({
        data: {
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
      })

      return NextResponse.json({ success: true, settings })
    }

    // Ayarları güncelle
    const settings = await prisma.termSettings.update({
      where: { termId },
      data: {
        firstLessonStart: body.firstLessonStart ?? existing.firstLessonStart,
        lessonDuration: body.lessonDuration ?? existing.lessonDuration,
        breakDuration: body.breakDuration ?? existing.breakDuration,
        lunchBreakStart: body.lunchBreakStart ?? existing.lunchBreakStart,
        lunchBreakDuration:
          body.lunchBreakDuration ?? existing.lunchBreakDuration,
        hasStudyHall: body.hasStudyHall ?? existing.hasStudyHall,
        studyHallStart: body.hasStudyHall
          ? body.studyHallStart ?? existing.studyHallStart
          : null,
        studyHallDuration: body.hasStudyHall
          ? body.studyHallDuration ?? existing.studyHallDuration
          : null,
        workingDays: body.workingDays ?? existing.workingDays,
        examWeeks: body.examWeeks ?? existing.examWeeks,
      },
    })

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Term settings PUT error:', error)
    return NextResponse.json(
      { error: 'Ayarlar güncellenemedi' },
      { status: 500 }
    )
  }
}

