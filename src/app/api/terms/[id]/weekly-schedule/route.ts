import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  checkCourseCounter,
  getCourseCounters,
  calculateRemainingWeeks,
  calculateWeeklyHours,
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
    const { weekNumber, generateAll } = body

    if (generateAll) {
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
        const counterResult = await checkCourseCounter(termId, lesson.courseId, totalPlannedHours, weekEndDate)

        return {
          ...lesson,
          occurrenceCount: counterResult.occurrenceCount,
          totalPlannedHours,
        }
      })
    )

    return NextResponse.json({
      weekNumber,
      weekStartDate,
      weekEndDate,
      dailyLessons: lessonsWithCounters,
      classes: term.classes,
      timeSlots,
      term: {
        id: term.id,
        name: term.name,
        startDate: term.startDate,
        endDate: term.endDate,
      },
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

  const weekMonth = weekStartDate.getMonth() + 1
  const weekYear = weekStartDate.getFullYear()

  const monthlyPlans = await prisma.monthlyCoursePlan.findMany({
    where: {
      termCoursePlan: {
        termId,
      },
      month: weekMonth,
      year: weekYear,
      plannedHours: {
        gt: 0,
      },
    },
    include: {
      termCoursePlan: {
        include: {
          course: {
            include: {
              courseInstructors: {
                where: { isActive: true },
                include: {
                  instructor: true,
                },
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

  const courseIds = monthlyPlans.map((mp) => mp.termCoursePlan.courseId)
  const counters = await getCourseCounters(termId, weekEndDate, courseIds)
  const remainingWeeks = calculateRemainingWeeks(weekEndDate, term.endDate)

  interface CourseWithRemaining {
    id: string
    name: string
    code: string
    requiresLab: boolean
    remainingHours: number
    occurrenceCount: number
    totalPlannedHours: number
    weeklyHours: number
    instructorId?: string
  }

  const coursesWithRemaining: CourseWithRemaining[] = []

  for (const monthlyPlan of monthlyPlans) {
    const course = monthlyPlan.termCoursePlan.course
    const totalPlannedHours = monthlyPlan.termCoursePlan.totalPlannedHours
    const counter = counters.get(course.id)
    const occurrenceCount = counter?.occurrenceCount || 0
    const remainingHours = totalPlannedHours - occurrenceCount

    if (remainingHours <= 0) {
      continue
    }

    const weeklyHours = calculateWeeklyHours(remainingHours, remainingWeeks)
    const firstInstructor = course.courseInstructors[0]?.instructor?.id

    coursesWithRemaining.push({
      id: course.id,
      name: course.name,
      code: course.code,
      requiresLab: course.requiresLab,
      remainingHours,
      occurrenceCount,
      totalPlannedHours,
      weeklyHours,
      instructorId: firstInstructor,
    })
  }

  const workingDays = (term.settings.workingDays as string[]) || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
  const dayNames: string[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const createdLessons = []

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDate = new Date(weekStartDate)
    currentDate.setDate(weekStartDate.getDate() + dayOffset)

    const dayOfWeek = currentDate.getDay()
    const dayName = dayNames[dayOfWeek]

    if (!workingDays.includes(dayName)) {
      continue
    }

    const dateKey = currentDate.toISOString()
    const occupiedSlotIds = specialEventSlots.get(dateKey) || []
    const freeSlots = timeSlots.filter((s) => !occupiedSlotIds.includes(s.id))

    const sortedCourses = [...coursesWithRemaining]
      .filter((c) => c.remainingHours > 0 && c.weeklyHours > 0)
      .sort((a, b) => b.remainingHours - a.remainingHours)

    for (const classItem of classes) {
      const classCourseCopies = JSON.parse(JSON.stringify(sortedCourses)) as CourseWithRemaining[]

      for (const slot of freeSlots) {
        let assignedCourse: CourseWithRemaining | null = null

        for (const course of classCourseCopies) {
          const alreadyScheduledToday = await prisma.dailyLesson.findFirst({
            where: {
              termId,
              classId: classItem.id,
              courseId: course.id,
              specificDate: currentDate,
              isCancelled: false,
            },
          })

          if (alreadyScheduledToday) {
            continue
          }

          if (course.requiresLab) {
            const labConflict = await prisma.dailyLesson.findFirst({
              where: {
                termId,
                specificDate: currentDate,
                timeSlotId: slot.id,
                course: {
                  requiresLab: true,
                },
                isCancelled: false,
              },
            })

            if (labConflict) {
              continue
            }
          }

          assignedCourse = course
          break
        }

        if (!assignedCourse) {
          continue
        }

        const lesson = await prisma.dailyLesson.create({
          data: {
            termId,
            classId: classItem.id,
            courseId: assignedCourse.id,
            instructorId: assignedCourse.instructorId || null,
            dayOfWeek: dayName as any,
            timeSlotId: slot.id,
            specificDate: currentDate,
            isSpecialEvent: false,
            requiresInstructor: true,
          },
        })

        createdLessons.push(lesson)

        assignedCourse.remainingHours--
        assignedCourse.occurrenceCount++

        const thisWeekCount = createdLessons.filter((l) => l.courseId === assignedCourse!.id).length

        if (thisWeekCount >= assignedCourse.weeklyHours) {
          const index = classCourseCopies.indexOf(assignedCourse)
          if (index > -1) {
            classCourseCopies.splice(index, 1)
          }
        }
      }
    }
  }

  return {
    message: `${weekNumber}. hafta programı oluşturuldu`,
    createdLessons: specialEvents.length + createdLessons.length,
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
