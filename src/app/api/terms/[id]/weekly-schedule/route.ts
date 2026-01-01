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

    const timeSlots = await prisma.timeSlot.findMany({
      orderBy: { slotNumber: 'asc' },
    })

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

    const totalWeeks = calculateTotalWeeks(term.startDate, term.endDate)
    console.log(`Generating programs for all ${totalWeeks} weeks`)

    const deleted = await prisma.dailyLesson.deleteMany({
      where: { termId },
    })
    console.log(`Deleted ${deleted.count} existing lessons`)

    let totalCreatedLessons = 0
    const weekResults: WeekGenerateResult[] = []

    for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
      try {
        const result = await generateSingleWeek(termId, weekNum)
        totalCreatedLessons += result.createdLessons || 0
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

  const timeSlots = await prisma.timeSlot.findMany({
    orderBy: { slotNumber: 'asc' },
  })

  if (timeSlots.length === 0) {
    throw new Error('TimeSlot bulunamadı')
  }

  const classes = term.classes || []

  if (classes.length === 0) {
    throw new Error('Sınıf bulunamadı')
  }

  const specialEvents = await createAllSpecialEvents({
    termId,
    weekNumber,
    weekStartDate,
    weekEndDate,
    classes,
    timeSlots,
  })

  if (weekNumber === 1) {
    for (const event of specialEvents) {
      await prisma.dailyLesson.create({ data: event })
    }

    return {
      message: `${weekNumber}. hafta programı oluşturuldu (İntibak Haftası)`,
      createdLessons: specialEvents.length,
      weekNumber,
      weekStartDate,
      weekEndDate,
    }
  }

  const specialEventSlots = new Map<string, string[]>()
  for (const event of specialEvents) {
    await prisma.dailyLesson.create({ data: event })

    const dateKey = event.specificDate.toISOString()
    if (!specialEventSlots.has(dateKey)) {
      specialEventSlots.set(dateKey, [])
    }
    specialEventSlots.get(dateKey)!.push(event.timeSlotId)
  }

  const peSlots = getPhysicalEducationReservedSlots(weekStartDate, timeSlots)
  for (const { date, slotId } of peSlots) {
    const dateKey = date.toISOString()
    if (!specialEventSlots.has(dateKey)) {
      specialEventSlots.set(dateKey, [])
    }
    if (!specialEventSlots.get(dateKey)!.includes(slotId)) {
      specialEventSlots.get(dateKey)!.push(slotId)
    }
  }

  const workingDays = (term.settings.workingDays as string[]) || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
  const dayNames: string[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

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

  const formatMonthKey = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}`

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

  const weekStartMonthKey = formatMonthKey(weekStartDate.getFullYear(), weekStartDate.getMonth() + 1)
  for (const mk of sortedPlanMonthKeys) {
    if (mk >= weekStartMonthKey) break
    const remainingMap = monthRemainingByMonthKey.get(mk)
    if (!remainingMap) continue
    for (const [courseId, remaining] of remainingMap.entries()) {
      backlogByCourseId.set(courseId, (backlogByCourseId.get(courseId) || 0) + remaining)
    }
  }

  let createdLessonsCount = 0

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

    for (const slot of freeSlots) {
      // Aday havuzu: bu ay planı olanlar + geçmiş aylardan backlog'u olanlar
      const monthPlannedCourseIds = (plansByMonthKey.get(monthKey) || []).map((p) => p.course.id)
      const candidateCourseIds = new Set<string>(monthPlannedCourseIds)
      for (const [courseId, backlog] of backlogByCourseId.entries()) {
        if (backlog > 0) candidateCourseIds.add(courseId)
      }

      const candidates = Array.from(candidateCourseIds)
        .map((courseId) => courseMetaById.get(courseId))
        .filter((c): c is CourseMeta => !!c)
        .filter((c) => {
          if (usedCourseIdsToday.has(c.id)) return false
          const monthlyRem = monthRemaining.get(c.id) || 0
          const backlog = backlogByCourseId.get(c.id) || 0
          const totalRem = totalRemainingByCourseId.get(c.id) || 0
          return (monthlyRem + backlog) > 0 && totalRem > 0
        })
        .sort((a, b) => {
          const aMonthly = (monthRemaining.get(a.id) || 0) + (backlogByCourseId.get(a.id) || 0)
          const bMonthly = (monthRemaining.get(b.id) || 0) + (backlogByCourseId.get(b.id) || 0)
          if (bMonthly !== aMonthly) return bMonthly - aMonthly
          const aTotal = totalRemainingByCourseId.get(a.id) || 0
          const bTotal = totalRemainingByCourseId.get(b.id) || 0
          if (bTotal !== aTotal) return bTotal - aTotal
          const aTie = hashToInt(`${a.id}-${dateKey}-${slot.slotNumber}`)
          const bTie = hashToInt(`${b.id}-${dateKey}-${slot.slotNumber}`)
          return aTie - bTie
        })

      const assignedCourse = candidates[0]
      if (!assignedCourse) {
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

      usedCourseIdsToday.add(assignedCourse.id)

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

  return {
    message: `${weekNumber}. hafta programı oluşturuldu`,
    createdLessons: specialEvents.length + createdLessonsCount,
    weekNumber,
    weekStartDate,
    weekEndDate,
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
