import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  checkCourseCounter,
  getCourseCounters,
  getMonthlyCounters,
  createAllSpecialEvents,
  getPhysicalEducationReservedSlots,
} from './algorithms'

interface WeekGenerateResult {
  weekNumber: number
  createdLessons: number
  status: 'success' | 'error'
  error?: string
}

async function getOrCreateDefaultTimeSlots() {
  const existing = await prisma.timeSlot.findMany({
    orderBy: { slotNumber: 'asc' },
  })

  if (existing.length > 0) return existing

  // Standart KKTC Polis Okulu mesai saatleri (global TimeSlot tablosu)
  const defaults = [
    { slotNumber: 1, startTime: '08:00', endTime: '08:45', isBreak: false },
    { slotNumber: 2, startTime: '09:00', endTime: '09:45', isBreak: false },
    { slotNumber: 3, startTime: '10:00', endTime: '10:45', isBreak: false },
    { slotNumber: 4, startTime: '11:00', endTime: '11:45', isBreak: false },
    { slotNumber: 5, startTime: '12:00', endTime: '12:45', isBreak: false },
    { slotNumber: 6, startTime: '12:45', endTime: '13:45', isBreak: true },
    { slotNumber: 7, startTime: '14:00', endTime: '14:45', isBreak: false },
    { slotNumber: 8, startTime: '15:00', endTime: '15:45', isBreak: false },
  ]

  await prisma.timeSlot.createMany({
    data: defaults,
    skipDuplicates: true,
  })

  return await prisma.timeSlot.findMany({
    orderBy: { slotNumber: 'asc' },
  })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const termId = params.id
    const body = await req.json()
    const { weekNumber, generateAll, regenerateAll, resetAndGenerateAll } = body
    const shouldGenerateAll = !!(generateAll || regenerateAll || resetAndGenerateAll)

    if (shouldGenerateAll) {
      return await generateAllWeeks(termId)
    }

    if (!weekNumber) {
      return NextResponse.json({ error: 'weekNumber gerekli' }, { status: 400 })
    }

    const result = await generateSingleWeek(termId, weekNumber)
    return NextResponse.json(result)
  } catch (error) {
    console.error('POST /weekly-schedule error:', error)
    return NextResponse.json(
      { error: 'Program oluşturulamadı', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const termId = params.id
    const { searchParams } = new URL(req.url)
    const weekNumber = parseInt(searchParams.get('weekNumber') || '1', 10)

    const term = await prisma.term.findUnique({
      where: { id: termId },
      include: {
        settings: true,
        classes: {
          where: { isDeleted: false },
          orderBy: { code: 'asc' },
        },
      },
    })

    if (!term) {
      return NextResponse.json({ error: 'Dönem bulunamadı' }, { status: 404 })
    }

    const { weekStartDate, weekEndDate } = calculateWeekDates(term.startDate, weekNumber)

    const dailyLessons = await prisma.dailyLesson.findMany({
      where: {
        termId,
        specificDate: {
          gte: weekStartDate,
          lte: weekEndDate,
        },
        isCancelled: false,
      },
      include: {
        course: true,
        instructor: true,
        class: true,
        timeSlot: true,
      },
      orderBy: [
        { specificDate: 'asc' },
        { timeSlot: { slotNumber: 'asc' } },
      ],
    })

    const timeSlots = await getOrCreateDefaultTimeSlots()

    const lessonsWithCounters = await Promise.all(
      dailyLessons.map(async (lesson) => {
        if (!lesson.courseId || lesson.isSpecialEvent) {
          return { ...lesson, occurrenceCount: 0, totalPlannedHours: 0 }
        }

        const termCoursePlan = await prisma.termCoursePlan.findFirst({
          where: {
            termId,
            courseId: lesson.courseId,
          },
        })

        const totalPlannedHours = termCoursePlan?.totalPlannedHours || 0
        // Her dersin kendi tarihi kullanılmalı (günden güne artış için)
        const lessonDate = lesson.specificDate ? new Date(lesson.specificDate) : new Date()
        lessonDate.setDate(lessonDate.getDate() + 1) // Ertesi günün başını kullan (o güne kadar olanları say)
        const counterResult = await checkCourseCounter(termId, lesson.courseId, totalPlannedHours, lessonDate)

        return {
          ...lesson,
          occurrenceCount: counterResult.occurrenceCount,
          totalPlannedHours,
        }
      })
    )

    // Format data into weekDays structure for frontend
    const weekDays = []
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
    const dayOfWeekNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDate = new Date(weekStartDate)
      currentDate.setDate(currentDate.getDate() + dayOffset)
      const dateStr = currentDate.toISOString().split('T')[0]
      const dayOfWeek = currentDate.getDay()
      
      const daySlots = timeSlots.map((timeSlot) => {
        const lesson = lessonsWithCounters.find(
          (l) =>
            !!l.specificDate &&
            l.specificDate.toISOString().split('T')[0] === dateStr &&
            l.timeSlot.slotNumber === timeSlot.slotNumber
        )
        
        if (lesson) {
          return {
            id: lesson.id,
            course: lesson.course ? {
              id: lesson.course.id,
              name: lesson.course.name,
              code: lesson.course.code,
              occurrenceCount: lesson.occurrenceCount,
              totalPlannedHours: lesson.totalPlannedHours,
            } : null,
            specialEvent: lesson.isSpecialEvent ? {
              id: lesson.id,
              eventTitle: lesson.course?.name || 'Özel Etkinlik',
            } : null,
            instructor: lesson.instructor,
            class: lesson.class,
            timeSlot: lesson.timeSlot,
          }
        }
        return null
      })
      
      weekDays.push({
        date: dateStr,
        dayOfWeek: dayOfWeekNames[dayOfWeek],
        dayName: dayNames[dayOfWeek],
        slots: daySlots,
      })
    }

    const totalWeeksCalculated = calculateTotalWeeks(term.startDate, term.endDate)

    return NextResponse.json({
      termId,
      weekNumber,
      weekStartDate: weekStartDate.toISOString().split('T')[0],
      weekEndDate: weekEndDate.toISOString().split('T')[0],
      weekDays,
      totalLessons: lessonsWithCounters.length,
      totalWeeks: totalWeeksCalculated,
    })
  } catch (error) {
    console.error('GET /weekly-schedule error:', error)
    return NextResponse.json(
      { error: 'Program getirilemedi', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const termId = params.id
    const { searchParams } = new URL(req.url)
    const weekNumber = parseInt(searchParams.get('weekNumber') || '1', 10)

    const term = await prisma.term.findUnique({
      where: { id: termId },
    })

    if (!term) {
      return NextResponse.json({ error: 'Dönem bulunamadı' }, { status: 404 })
    }

    const { weekStartDate, weekEndDate } = calculateWeekDates(term.startDate, weekNumber)

    const deleted = await prisma.dailyLesson.deleteMany({
      where: {
        termId,
        specificDate: {
          gte: weekStartDate,
          lte: weekEndDate,
        },
      },
    })

    return NextResponse.json({
      message: `${weekNumber}. hafta programı silindi`,
      deletedCount: deleted.count,
    })
  } catch (error) {
    console.error('DELETE /weekly-schedule error:', error)
    return NextResponse.json(
      { error: 'Program silinemedi', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    )
  }
}

async function generateAllWeeks(termId: string) {
  try {
    const term = await prisma.term.findUnique({
      where: { id: termId },
      include: {
        settings: true,
        classes: {
          where: { isDeleted: false },
        },
      },
    })

    if (!term) {
      return NextResponse.json({ error: 'Dönem bulunamadı' }, { status: 404 })
    }

    if (!term.settings) {
      return NextResponse.json({ error: 'Dönem ayarları bulunamadı' }, { status: 404 })
    }

    if (!term.classes || term.classes.length === 0) {
      return NextResponse.json(
        {
          error: 'Sınıf bulunamadı',
          details: 'Bu dönem için hiç sınıf tanımlanmamış. Dönem > Sınıflar bölümünden en az 1 sınıf ekleyin (örn: A).',
        },
        { status: 400 }
      )
    }

    const totalWeeks = calculateTotalWeeks(term.startDate, term.endDate)
    console.log(`Generating programs for all ${totalWeeks} weeks`)

    const deleted = await prisma.dailyLesson.deleteMany({
      where: { termId },
    })
    console.log(`Deleted ${deleted.count} existing lessons`)

    let totalCreatedLessons = 0
    let totalCreatedSlotOccurrences = 0
    let totalNoCandidateSlots = 0
    let totalLabConflictSkips = 0
    let totalStreakOverrideSlots = 0
    const weekResults: WeekGenerateResult[] = []

    for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
      try {
        const result = await generateSingleWeek(termId, weekNum)
        totalCreatedLessons += result.createdLessons || 0

        const debug = (result as any).debug as
          | {
              createdSlotOccurrences?: number
              skippedNoCandidateSlots?: number
              skippedLabConflictSlots?: number
              streakOverrideSlots?: number
            }
          | undefined

        totalCreatedSlotOccurrences += debug?.createdSlotOccurrences || 0
        totalNoCandidateSlots += debug?.skippedNoCandidateSlots || 0
        totalLabConflictSkips += debug?.skippedLabConflictSlots || 0
        totalStreakOverrideSlots += debug?.streakOverrideSlots || 0

        weekResults.push({
          weekNumber: weekNum,
          createdLessons: result.createdLessons || 0,
          status: 'success',
        })
        console.log(`Week ${weekNum}: ${result.createdLessons} lessons created`)
      } catch (error) {
        console.error(`Week ${weekNum} error:`, error)
        weekResults.push({
          weekNumber: weekNum,
          createdLessons: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Bilinmeyen hata',
        })
      }
    }

    return NextResponse.json({
      message: 'Tüm haftalar için program oluşturuldu',
      totalWeeks,
      totalCreatedLessons,
      weekResults,
      debug: {
        deletedLessons: deleted.count,
        totalCreatedSlotOccurrences,
        totalNoCandidateSlots,
        totalLabConflictSkips,
        totalStreakOverrideSlots,
      },
    })
  } catch (error) {
    console.error('Generate all weeks error:', error)
    return NextResponse.json(
      {
        error: 'Tüm haftalar için program oluşturulamadı',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata',
      },
      { status: 500 }
    )
  }
}

async function generateSingleWeek(termId: string, weekNumber: number) {
  const term = await prisma.term.findUnique({
    where: { id: termId },
    include: {
      settings: true,
      classes: {
        where: { isDeleted: false },
      },
    },
  })

  if (!term || !term.settings) {
    throw new Error('Dönem veya ayarlar bulunamadı')
  }

  const { weekStartDate, weekEndDate } = calculateWeekDates(term.startDate, weekNumber)

  await prisma.dailyLesson.deleteMany({
    where: {
      termId,
      specificDate: {
        gte: weekStartDate,
        lte: weekEndDate,
      },
    },
  })

  const timeSlots = await getOrCreateDefaultTimeSlots()

  if (timeSlots.length === 0) {
    throw new Error('TimeSlot bulunamadı (otomatik oluşturma başarısız)')
  }

  const classes = term.classes || []

  if (classes.length === 0) {
    throw new Error('Sınıf bulunamadı. Bu dönem için sınıf tanımlayın (Dönem > Sınıflar; örn: A).')
  }

  const specialEvents = await createAllSpecialEvents({
    termId,
    weekNumber,
    weekStartDate,
    weekEndDate,
    classes,
    timeSlots,
  })

  const formatMonthKey = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}`

  if (weekNumber === 1) {
    for (const event of specialEvents) {
      await prisma.dailyLesson.create({ data: event })
    }

    const workingDays = (term.settings.workingDays as string[]) || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
    const dayNames: string[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    let workingDaysCount = 0
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const d = new Date(weekStartDate)
      d.setDate(weekStartDate.getDate() + dayOffset)
      const dayName = dayNames[d.getDay()]
      if (workingDays.includes(dayName)) workingDaysCount += 1
    }

    const uniqueSlotSet = new Set<string>()
    for (const e of specialEvents) {
      uniqueSlotSet.add(`${e.specificDate.toISOString()}|${e.timeSlotId}`)
    }
    const specialEventUniqueSlots = uniqueSlotSet.size

    return {
      message: `${weekNumber}. hafta programı oluşturuldu (İntibak Haftası)`,
      createdLessons: specialEvents.length,
      weekNumber,
      weekStartDate,
      weekEndDate,
      debug: {
        weekNumber,
        weekStartDate,
        weekEndDate,
        classesCount: classes.length,
        timeSlotsCount: timeSlots.length,
        workingDaysCount,
        specialEventUniqueSlots,
        peReservedUniqueSlots: 0,
        totalBlockedUniqueSlots: specialEventUniqueSlots,
        totalFreeSlots: 0,
        createdSlotOccurrences: 0,
        createdLessonsRows: 0,
        skippedNoCandidateSlots: 0,
        skippedLabConflictSlots: 0,
        streakOverrideSlots: 0,
        backlogStartTotal: 0,
        backlogEndTotal: 0,
        totalRemainingStart: 0,
        totalRemainingEnd: 0,
      },
    }
  }

  const specialEventSlots = new Map<string, string[]>()
  let specialEventUniqueSlots = 0
  for (const event of specialEvents) {
    await prisma.dailyLesson.create({ data: event })

    const dateKey = event.specificDate.toISOString()
    if (!specialEventSlots.has(dateKey)) {
      specialEventSlots.set(dateKey, [])
    }

    const arr = specialEventSlots.get(dateKey)!
    if (!arr.includes(event.timeSlotId)) {
      arr.push(event.timeSlotId)
      specialEventUniqueSlots += 1
    }
  }

  const peSlots = getPhysicalEducationReservedSlots(weekStartDate, timeSlots)
  let peReservedUniqueSlots = 0
  for (const { date, slotId } of peSlots) {
    const dateKey = date.toISOString()
    if (!specialEventSlots.has(dateKey)) {
      specialEventSlots.set(dateKey, [])
    }
    if (!specialEventSlots.get(dateKey)!.includes(slotId)) {
      specialEventSlots.get(dateKey)!.push(slotId)
      peReservedUniqueSlots += 1
    }
  }

  const workingDays = (term.settings.workingDays as string[]) || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
  const dayNames: string[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

  const workingDaysSet = new Set(workingDays.filter((d) => d !== 'SATURDAY' && d !== 'SUNDAY'))
  const startOfDay = (d: Date) => {
    const x = new Date(d)
    x.setHours(0, 0, 0, 0)
    return x
  }
  const formatDateOnly = (d: Date) => d.toISOString().split('T')[0]
  const isWorkingDay = (d: Date) => workingDaysSet.has(dayNames[d.getDay()])
  const termStartDay = startOfDay(term.startDate)
  const termEndDay = startOfDay(term.endDate)

  const getPrevWorkingDay = (d: Date) => {
    let x = startOfDay(d)
    x.setDate(x.getDate() - 1)
    while (x >= termStartDay && !isWorkingDay(x)) {
      x.setDate(x.getDate() - 1)
    }
    return x
  }

  const countRemainingWorkingDaysInMonth = (fromDate: Date) => {
    const start = startOfDay(fromDate)
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0)
    end.setHours(0, 0, 0, 0)

    let count = 0
    for (let d = new Date(start); d <= end && d <= termEndDay; d.setDate(d.getDate() + 1)) {
      if (isWorkingDay(d)) count += 1
    }
    return Math.max(1, count)
  }

  // Bu haftanın (iş günleri) kapsadığı ay/yıl kombinasyonlarını bul (ay sınırı haftaları için)
  const schedulableDates: Date[] = []

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDate = new Date(weekStartDate)
    currentDate.setDate(weekStartDate.getDate() + dayOffset)

    const dayName = dayNames[currentDate.getDay()]
    if (!workingDays.includes(dayName)) continue

    schedulableDates.push(currentDate)
  }

  if (schedulableDates.length === 0) {
    return {
      message: `${weekNumber}. hafta için iş günü bulunamadı`,
      createdLessons: specialEvents.length,
      weekNumber,
      weekStartDate,
      weekEndDate,
    }
  }

  // Aylık planlar: kapasite aşımı olursa artan saatleri sonraki aylara devredebilmek için
  // dönem boyunca tüm aylık planları al (ay bazında strict değil, carry-over var).
  const monthlyPlans = await prisma.monthlyCoursePlan.findMany({
    where: {
      termCoursePlan: { termId },
      plannedHours: { gt: 0 },
    },
    include: {
      termCoursePlan: {
        include: {
          course: {
            include: {
              courseInstructors: {
                include: { instructor: true },
              },
            },
          },
        },
      },
    },
  })

  if (monthlyPlans.length === 0) {
    return {
      message: `${weekNumber}. hafta için aylık plan bulunamadı`,
      createdLessons: specialEvents.length,
      weekNumber,
      weekStartDate,
      weekEndDate,
    }
  }

  type CourseMeta = {
    id: string
    name: string
    code: string
    requiresLab: boolean
    instructorId: string | null
    totalPlannedHours: number
  }

  const plansByMonthKey = new Map<string, Array<{ course: CourseMeta; monthlyPlannedHours: number }>>()
  const plannedHoursByMonthKeyCourseId = new Map<string, Map<string, number>>()
  const allPlanMonthKeys = new Set<string>()
  const courseMetaById = new Map<string, CourseMeta>()

  for (const mp of monthlyPlans) {
    const course = mp.termCoursePlan.course
    const monthKey = formatMonthKey(mp.year, mp.month)
    const firstInstructor = course.courseInstructors[0]?.instructor?.id || null
    const meta: CourseMeta = {
      id: course.id,
      name: course.name,
      code: course.code,
      requiresLab: course.requiresLab,
      instructorId: firstInstructor,
      totalPlannedHours: mp.termCoursePlan.totalPlannedHours,
    }

    courseMetaById.set(meta.id, meta)
    if (!plansByMonthKey.has(monthKey)) plansByMonthKey.set(monthKey, [])
    plansByMonthKey.get(monthKey)!.push({ course: meta, monthlyPlannedHours: mp.plannedHours })

    if (!plannedHoursByMonthKeyCourseId.has(monthKey)) plannedHoursByMonthKeyCourseId.set(monthKey, new Map())
    plannedHoursByMonthKeyCourseId.get(monthKey)!.set(meta.id, mp.plannedHours)
    allPlanMonthKeys.add(monthKey)
  }

  const sortedPlanMonthKeys = Array.from(allPlanMonthKeys).sort()

  // Toplam sayaç (dönem geneli) - bu haftanın başından ÖNCE
  const allCourseIds = Array.from(courseMetaById.keys())
  const totalCounters = await getCourseCounters(termId, weekStartDate, allCourseIds)
  const totalRemainingByCourseId = new Map<string, number>()

  for (const courseId of allCourseIds) {
    const meta = courseMetaById.get(courseId)
    if (!meta) continue
    const occurrenceCount = totalCounters.get(courseId)?.occurrenceCount || 0
    totalRemainingByCourseId.set(courseId, Math.max(0, meta.totalPlannedHours - occurrenceCount))
  }

  // Aylık sayaçlar (her ay için) - bu haftanın başından ÖNCE
  const previousDay = new Date(weekStartDate)
  previousDay.setDate(previousDay.getDate() - 1)
  previousDay.setHours(23, 59, 59, 999)

  // Tüm aylar için gerçekleşeni tek sorguda çek (distinct courseId+specificDate)
  const distinctLessonsUpToPreviousDay = await prisma.dailyLesson.findMany({
    where: {
      termId,
      courseId: { in: allCourseIds },
      specificDate: { lte: previousDay },
      isCancelled: false,
      isSpecialEvent: false,
    },
    select: { courseId: true, specificDate: true },
    distinct: ['courseId', 'specificDate'],
  })

  const actualCountByMonthKeyCourseId = new Map<string, Map<string, number>>()
  for (const row of distinctLessonsUpToPreviousDay) {
    if (!row.courseId || !row.specificDate) continue
    const mk = formatMonthKey(row.specificDate.getFullYear(), row.specificDate.getMonth() + 1)
    if (!actualCountByMonthKeyCourseId.has(mk)) actualCountByMonthKeyCourseId.set(mk, new Map())
    const m = actualCountByMonthKeyCourseId.get(mk)!
    m.set(row.courseId, (m.get(row.courseId) || 0) + 1)
  }

  // monthRemaining: ilgili ayın kendi planından kalan
  const monthRemainingByMonthKey = new Map<string, Map<string, number>>()
  for (const mk of sortedPlanMonthKeys) {
    const remainingMap = new Map<string, number>()
    const plannedMap = plannedHoursByMonthKeyCourseId.get(mk) || new Map()
    const actualMap = actualCountByMonthKeyCourseId.get(mk) || new Map()

    for (const courseId of allCourseIds) {
      const planned = plannedMap.get(courseId) || 0
      const actual = actualMap.get(courseId) || 0
      const remaining = Math.max(0, planned - actual)
      if (remaining > 0) remainingMap.set(courseId, remaining)
    }

    monthRemainingByMonthKey.set(mk, remainingMap)
  }

  // Carry-over backlog: geçmiş aylardan devreden eksikler (kural değişmeden, sadece ay bazında esnetme)
  const backlogByCourseId = new Map<string, number>()
  for (const courseId of allCourseIds) backlogByCourseId.set(courseId, 0)

  // Streak (arka arkaya gün) kontrolü için: courseId -> Set<YYYY-MM-DD>
  const scheduledDateStrsByCourseId = new Map<string, Set<string>>()
  for (const courseId of allCourseIds) scheduledDateStrsByCourseId.set(courseId, new Set())
  for (const row of distinctLessonsUpToPreviousDay) {
    if (!row.courseId || !row.specificDate) continue
    scheduledDateStrsByCourseId.get(row.courseId)?.add(formatDateOnly(row.specificDate))
  }

  const weekStartMonthKey = formatMonthKey(weekStartDate.getFullYear(), weekStartDate.getMonth() + 1)
  for (const mk of sortedPlanMonthKeys) {
    if (mk >= weekStartMonthKey) break
    const remainingMap = monthRemainingByMonthKey.get(mk)
    if (!remainingMap) continue
    for (const [courseId, remaining] of remainingMap.entries()) {
      backlogByCourseId.set(courseId, (backlogByCourseId.get(courseId) || 0) + remaining)
    }
  }

  const backlogStartTotal = Array.from(backlogByCourseId.values()).reduce((acc, v) => acc + v, 0)
  const totalRemainingStart = Array.from(totalRemainingByCourseId.values()).reduce((acc, v) => acc + v, 0)

  let createdLessonsCount = 0
  let createdSlotOccurrences = 0
  let skippedNoCandidateSlots = 0
  let skippedLabConflictSlots = 0
  let streakOverrideSlots = 0
  let totalFreeSlots = 0
  let totalBlockedUniqueSlots = 0

  for (const slotIds of specialEventSlots.values()) {
    totalBlockedUniqueSlots += slotIds.length
  }

  const hashToInt = (value: string) => {
    let hash = 0
    for (let i = 0; i < value.length; i++) {
      hash = (hash * 31 + value.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
  }

  // Haftayı gün-gün, slot-slot doldur: Her slot için TEK ders seç, tüm sınıflara aynı dersi yaz.
  let lastMonthKey: string | null = null

  for (const currentDate of schedulableDates) {
    const dayName = dayNames[currentDate.getDay()]
    const dateKey = currentDate.toISOString()
    const occupiedSlotIds = specialEventSlots.get(dateKey) || []
    const freeSlots = timeSlots.filter((s) => !occupiedSlotIds.includes(s.id))
    totalFreeSlots += freeSlots.length

    const monthKey = formatMonthKey(currentDate.getFullYear(), currentDate.getMonth() + 1)

    // Ay geçişinde: bir önceki ayın kalanını backlog'a ekle (ay bitti, artık devredebilir)
    if (lastMonthKey && lastMonthKey !== monthKey) {
      const prevRemaining = monthRemainingByMonthKey.get(lastMonthKey)
      if (prevRemaining) {
        for (const [courseId, remaining] of prevRemaining.entries()) {
          backlogByCourseId.set(courseId, (backlogByCourseId.get(courseId) || 0) + remaining)
        }
        // Bu ay artık geçmiş oldu: kalanlar backlog'a taşındı, ay içi kalan map'ini sıfırla
        prevRemaining.clear()
      }
    }
    lastMonthKey = monthKey

    const monthRemaining = monthRemainingByMonthKey.get(monthKey) || new Map<string, number>()

    const usedCourseIdsToday = new Set<string>()

    // Tempo: ayın geri kalan iş günü sayısı (en az 1)
    const remainingWorkingDaysInMonth = countRemainingWorkingDaysInMonth(currentDate)

    // Streak: bir önceki 2 iş günü
    const prevWorkDay = getPrevWorkingDay(currentDate)
    const prevPrevWorkDay = getPrevWorkingDay(prevWorkDay)
    const prevWorkDayStr = prevWorkDay >= termStartDay ? formatDateOnly(prevWorkDay) : null
    const prevPrevWorkDayStr = prevPrevWorkDay >= termStartDay ? formatDateOnly(prevPrevWorkDay) : null

    const computeStreakLen = (courseId: string) => {
      const set = scheduledDateStrsByCourseId.get(courseId)
      if (!set) return 0
      const hasPrev = prevWorkDayStr ? set.has(prevWorkDayStr) : false
      const hasPrevPrev = prevPrevWorkDayStr ? set.has(prevPrevWorkDayStr) : false
      if (hasPrev && hasPrevPrev) return 2
      if (hasPrev) return 1
      return 0
    }

    for (const slot of freeSlots) {
      // Aday havuzu: bu ay planı olanlar + geçmiş aylardan backlog'u olanlar
      const monthPlannedCourseIds = (plansByMonthKey.get(monthKey) || []).map((p) => p.course.id)
      const candidateCourseIds = new Set<string>(monthPlannedCourseIds)
      for (const [courseId, backlog] of backlogByCourseId.entries()) {
        if (backlog > 0) candidateCourseIds.add(courseId)
      }

      const candidatesAll = Array.from(candidateCourseIds)
        .map((courseId) => courseMetaById.get(courseId))
        .filter((c): c is CourseMeta => !!c)
        .filter((c) => {
          if (usedCourseIdsToday.has(c.id)) return false
          const monthlyRem = monthRemaining.get(c.id) || 0
          const backlog = backlogByCourseId.get(c.id) || 0
          const totalRem = totalRemainingByCourseId.get(c.id) || 0
          return (monthlyRem + backlog) > 0 && totalRem > 0
        })

      // Maks 2 iş günü üst üste: 3. gün üst üste yazmayı öncelikle engelle.
      // Eğer bu filtre yüzünden hiç aday kalmazsa (nadir), override ederek yine de ders yaz.
      const candidatesStrict = candidatesAll.filter((c) => computeStreakLen(c.id) < 2)
      if (candidatesStrict.length === 0 && candidatesAll.length > 0) {
        streakOverrideSlots += 1
      }

      const candidates = (candidatesStrict.length > 0 ? candidatesStrict : candidatesAll).sort((a, b) => {
        const aNeed = (monthRemaining.get(a.id) || 0) + (backlogByCourseId.get(a.id) || 0)
        const bNeed = (monthRemaining.get(b.id) || 0) + (backlogByCourseId.get(b.id) || 0)

        // Tempo: need / remainingWorkingDaysInMonth (yüksek tempo önce)
        const aPace = aNeed / remainingWorkingDaysInMonth
        const bPace = bNeed / remainingWorkingDaysInMonth
        if (bPace !== aPace) return bPace - aPace

        // Arka arkaya yığılmayı kır: streak kısa olanı tercih et
        const aStreak = computeStreakLen(a.id)
        const bStreak = computeStreakLen(b.id)
        if (aStreak !== bStreak) return aStreak - bStreak

        // Kalan ihtiyaç büyük olan öne
        if (bNeed !== aNeed) return bNeed - aNeed

        // Dönem toplam kalanı büyük olan öne
        const aTotal = totalRemainingByCourseId.get(a.id) || 0
        const bTotal = totalRemainingByCourseId.get(b.id) || 0
        if (bTotal !== aTotal) return bTotal - aTotal

        const aTie = hashToInt(`${a.id}-${dateKey}-${slot.slotNumber}`)
        const bTie = hashToInt(`${b.id}-${dateKey}-${slot.slotNumber}`)
        return aTie - bTie
      })

      const assignedCourse = candidates[0]
      if (!assignedCourse) {
        skippedNoCandidateSlots += 1
        continue
      }

      // Lab çakışması kontrolü (tek lab varsayımı)
      if (assignedCourse.requiresLab) {
        const labConflict = await prisma.dailyLesson.findFirst({
          where: {
            termId,
            specificDate: currentDate,
            timeSlotId: slot.id,
            course: { requiresLab: true },
            isCancelled: false,
          },
        })

        if (labConflict) {
          skippedLabConflictSlots += 1
          continue
        }
      }

      await prisma.dailyLesson.createMany({
        data: classes.map((classItem) => ({
          termId,
          classId: classItem.id,
          courseId: assignedCourse.id,
          instructorId: assignedCourse.instructorId,
          dayOfWeek: dayName as any,
          timeSlotId: slot.id,
          specificDate: currentDate,
          isSpecialEvent: false,
          requiresInstructor: true,
        })),
      })

      createdLessonsCount += classes.length
      createdSlotOccurrences += 1

      usedCourseIdsToday.add(assignedCourse.id)

      // Streak datasını güncelle (günde 1 kez yazıldığı varsayımıyla date bazında yeterli)
      scheduledDateStrsByCourseId.get(assignedCourse.id)?.add(formatDateOnly(currentDate))

      // Önce backlog'u tüket, backlog yoksa ay içi kalanını azalt
      const currentBacklog = backlogByCourseId.get(assignedCourse.id) || 0
      if (currentBacklog > 0) {
        backlogByCourseId.set(assignedCourse.id, Math.max(0, currentBacklog - 1))
      } else {
        monthRemaining.set(assignedCourse.id, Math.max(0, (monthRemaining.get(assignedCourse.id) || 0) - 1))
      }

      totalRemainingByCourseId.set(
        assignedCourse.id,
        Math.max(0, (totalRemainingByCourseId.get(assignedCourse.id) || 0) - 1)
      )
    }
  }

  const backlogEndTotal = Array.from(backlogByCourseId.values()).reduce((acc, v) => acc + v, 0)
  const totalRemainingEnd = Array.from(totalRemainingByCourseId.values()).reduce((acc, v) => acc + v, 0)

  const topBacklog = Array.from(backlogByCourseId.entries())
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([courseId, remaining]) => {
      const meta = courseMetaById.get(courseId)
      return {
        courseId,
        code: meta?.code || courseId,
        name: meta?.name || '',
        remaining,
      }
    })

  return {
    message: `${weekNumber}. hafta programı oluşturuldu`,
    createdLessons: specialEvents.length + createdLessonsCount,
    weekNumber,
    weekStartDate,
    weekEndDate,
    debug: {
      weekNumber,
      weekStartDate,
      weekEndDate,
      classesCount: classes.length,
      timeSlotsCount: timeSlots.length,
      workingDaysCount: schedulableDates.length,
      specialEventUniqueSlots,
      peReservedUniqueSlots,
      totalBlockedUniqueSlots,
      totalFreeSlots,
      createdSlotOccurrences,
      createdLessonsRows: createdLessonsCount,
      skippedNoCandidateSlots,
      skippedLabConflictSlots,
      streakOverrideSlots,
      backlogStartTotal,
      backlogEndTotal,
      totalRemainingStart,
      totalRemainingEnd,
      topBacklog,
    },
  }
}

function calculateWeekDates(termStartDate: Date, weekNumber: number) {
  const startDate = new Date(termStartDate)
  const startDayOfWeek = startDate.getDay()
  const daysToMonday = startDayOfWeek === 0 ? -6 : 1 - startDayOfWeek
  const firstMonday = new Date(startDate)
  firstMonday.setDate(startDate.getDate() + daysToMonday)
  firstMonday.setHours(0, 0, 0, 0)

  const weekStartDate = new Date(firstMonday)
  weekStartDate.setDate(firstMonday.getDate() + (weekNumber - 1) * 7)

  const weekEndDate = new Date(weekStartDate)
  weekEndDate.setDate(weekStartDate.getDate() + 6)
  weekEndDate.setHours(23, 59, 59, 999)

  return { weekStartDate, weekEndDate }
}

function calculateTotalWeeks(startDate: Date, endDate: Date) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const startDayOfWeek = start.getDay()
  const daysToMonday = startDayOfWeek === 0 ? -6 : 1 - startDayOfWeek
  const firstMonday = new Date(start)
  firstMonday.setDate(start.getDate() + daysToMonday)
  firstMonday.setHours(0, 0, 0, 0)

  const totalWeeks = Math.ceil((end.getTime() - firstMonday.getTime()) / (7 * 24 * 60 * 60 * 1000))
  return totalWeeks
}

// Bir ayda kaç hafta (iş haftası) olduğunu hesapla
function getWeeksInMonth(year: number, month: number): number {
  // Ayın ilk ve son gününü bul
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  
  // Ayın ilk pazartesisini bul
  let firstMonday = new Date(firstDay)
  while (firstMonday.getDay() !== 1) {
    firstMonday.setDate(firstMonday.getDate() + 1)
  }
  
  // Ayın son cumasını bul
  let lastFriday = new Date(lastDay)
  while (lastFriday.getDay() !== 5) {
    lastFriday.setDate(lastFriday.getDate() - 1)
  }
  
  // Kaç tam hafta var?
  const weeks = Math.ceil((lastFriday.getTime() - firstMonday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
  return Math.max(1, weeks)
}

// Haftanın ay içinde kaçıncı hafta olduğunu bul
function getWeekOfMonth(date: Date): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  let firstMonday = new Date(firstDay)
  while (firstMonday.getDay() !== 1) {
    firstMonday.setDate(firstMonday.getDate() + 1)
  }
  
  const diff = date.getTime() - firstMonday.getTime()
  const weekNumber = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1
  return Math.max(1, weekNumber)
}
