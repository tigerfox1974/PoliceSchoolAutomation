import { prisma } from '@/lib/prisma'
import { DayOfWeek } from '@prisma/client'
import { checkCourseOnDay, checkLabConflict, isSlotOccupied } from './scheduleValidators'

/**
 * Gün bazlı slot doldurma
 * Her gün 7 slot dolu olmalı
 */

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

interface FillDayOptions {
  termId: string
  date: Date
  dayOfWeek: DayOfWeek
  classId: string
  courses: CourseWithRemaining[]
  timeSlots: Array<{ id: string; slotNumber: number; startTime: string; endTime: string }>
  occupiedSlotIds: string[] // Önceden dolu olan slotlar (özel etkinlikler, beden eğitimi)
}

/**
 * Bir gün için boş slotları doldur
 */
export async function fillDaySlots(
  options: FillDayOptions
): Promise<Array<{
  termId: string
  classId: string
  courseId: string
  instructorId: string | null
  dayOfWeek: DayOfWeek
  timeSlotId: string
  specificDate: Date
  isSpecialEvent: boolean
  requiresInstructor: boolean
}>> {
  const { termId, date, dayOfWeek, classId, courses, timeSlots, occupiedSlotIds } = options

  const dailyLessons: Array<any> = []

  // 1. Boş slotları bul
  const freeSlots = timeSlots.filter((s) => !occupiedSlotIds.includes(s.id))

  // 2. Dersleri önceliğe göre sırala (remainingHours fazla olanlar önce)
  const sortedCourses = [...courses]
    .filter((c) => c.remainingHours > 0 && c.weeklyHours > 0)
    .sort((a, b) => b.remainingHours - a.remainingHours)

  // 3. Her boş slot için ders ata
  for (const slot of freeSlots) {
    // Uygun ders bul
    let assignedCourse: CourseWithRemaining | null = null

    for (const course of sortedCourses) {
      // Bu günde bu ders zaten var mı?
      const alreadyScheduledToday = await checkCourseOnDay(termId, course.id, date)
      if (alreadyScheduledToday) {
        continue // Bu ders bugün zaten yazılmış, atla
      }

      // Lab çakışması var mı?
      const labConflict = await checkLabConflict(termId, date, slot.id, course.requiresLab)
      if (labConflict) {
        continue // Lab çakışması var, atla
      }

      // Slot zaten dolu mu? (başka sınıf için)
      const slotOccupied = await isSlotOccupied(termId, classId, date, slot.id)
      if (slotOccupied) {
        continue // Slot dolu, atla
      }

      // Uygun ders bulundu!
      assignedCourse = course
      break
    }

    // Eğer uygun ders bulunamazsa, boş bırak (daha sonra manuel atanabilir)
    if (!assignedCourse) {
      continue
    }

    // Dersi bu slota ata
    dailyLessons.push({
      termId,
      classId,
      courseId: assignedCourse.id,
      instructorId: assignedCourse.instructorId || null,
      dayOfWeek,
      timeSlotId: slot.id,
      specificDate: date,
      isSpecialEvent: false,
      requiresInstructor: true,
    })

    // Dersin kalan saatini azalt (bellekte)
    assignedCourse.remainingHours--
    assignedCourse.occurrenceCount++

    // Eğer dersin bu haftaki hedefi doluysa, listeden çıkar
    if (assignedCourse.weeklyHours > 0) {
      // Bu haftada kaç kez yazıldı?
      const thisWeekCount = dailyLessons.filter((l) => l.courseId === assignedCourse!.id).length
      
      if (thisWeekCount >= assignedCourse.weeklyHours) {
        // Bu hafta için bu ders dolu, listeden çıkar
        const index = sortedCourses.indexOf(assignedCourse)
        if (index > -1) {
          sortedCourses.splice(index, 1)
        }
      }
    }
  }

  return dailyLessons
}

/**
 * Tüm sınıflar için bir günü doldur
 */
export async function fillDayForAllClasses(
  termId: string,
  date: Date,
  dayOfWeek: DayOfWeek,
  classes: Array<{ id: string; code: string }>,
  courses: CourseWithRemaining[],
  timeSlots: Array<{ id: string; slotNumber: number; startTime: string; endTime: string }>,
  occupiedSlotIds: string[]
): Promise<Array<any>> {
  const allLessons: Array<any> = []

  for (const classItem of classes) {
    const classLessons = await fillDaySlots({
      termId,
      date,
      dayOfWeek,
      classId: classItem.id,
      courses: JSON.parse(JSON.stringify(courses)), // Deep copy (her sınıf için bağımsız)
      timeSlots,
      occupiedSlotIds,
    })

    allLessons.push(...classLessons)
  }

  return allLessons
}

/**
 * Bir haftanın tüm günlerini doldur
 */
export async function fillWeekForAllClasses(
  termId: string,
  weekStartDate: Date,
  weekEndDate: Date,
  classes: Array<{ id: string; code: string }>,
  courses: CourseWithRemaining[],
  timeSlots: Array<{ id: string; slotNumber: number; startTime: string; endTime: string }>,
  specialEventSlots: Map<string, string[]> // date.toISOString() -> slotIds
): Promise<Array<any>> {
  const allLessons: Array<any> = []

  const dayNames: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']

  // Her gün için
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDate = new Date(weekStartDate)
    currentDate.setDate(weekStartDate.getDate() + dayOffset)

    // Hafta sonu kontrolü
    const dayOfWeek = currentDate.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      continue // Cumartesi ve Pazar atla
    }

    const dayOfWeekEnum = dayNames[dayOfWeek]
    const dateKey = currentDate.toISOString()
    const occupiedSlotIds = specialEventSlots.get(dateKey) || []

    const dayLessons = await fillDayForAllClasses(
      termId,
      currentDate,
      dayOfWeekEnum,
      classes,
      courses,
      timeSlots,
      occupiedSlotIds
    )

    allLessons.push(...dayLessons)
  }

  return allLessons
}
