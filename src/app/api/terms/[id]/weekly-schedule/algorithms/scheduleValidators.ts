import { prisma } from '@/lib/prisma'

/**
 * Lab çakışma kontrolü
 * Aynı saatte başka bir lab dersi var mı kontrol eder
 */
export async function checkLabConflict(
  termId: string,
  date: Date,
  timeSlotId: string,
  requiresLab: boolean
): Promise<boolean> {
  // Eğer bu ders lab gerektirmiyorsa, çakışma yok
  if (!requiresLab) return false

  // Bu tarih + bu saat + lab:true olan başka ders var mı?
  const existingLabLesson = await prisma.dailyLesson.findFirst({
    where: {
      termId,
      specificDate: date,
      timeSlotId,
      course: {
        requiresLab: true,
      },
      isCancelled: false,
    },
  })

  // Varsa çakışma var
  return existingLabLesson !== null
}

/**
 * Resmi tatil kontrolü (gelecekte eklenecek)
 */
export async function isPublicHoliday(date: Date): Promise<boolean> {
  const holiday = await prisma.publicHoliday.findFirst({
    where: {
      date: {
        gte: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0),
        lte: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59),
      },
    },
  })

  return holiday !== null
}

/**
 * Sınav haftası kontrolü (gelecekte eklenecek)
 * TermSettings.examWeeks JSON alanından kontrol edilecek
 */
export function isExamWeek(
  date: Date,
  examWeeks: Array<{ startDate: string; endDate: string; type: string }> | null
): boolean {
  if (!examWeeks || examWeeks.length === 0) return false

  const dateTime = date.getTime()

  return examWeeks.some((examWeek) => {
    const startTime = new Date(examWeek.startDate).getTime()
    const endTime = new Date(examWeek.endDate).getTime()
    return dateTime >= startTime && dateTime <= endTime
  })
}

/**
 * Hafta sonu kontrolü
 */
export function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay()
  return dayOfWeek === 0 || dayOfWeek === 6 // Pazar veya Cumartesi
}

/**
 * Çalışma günü mü kontrolü
 */
export function isWorkingDay(
  date: Date,
  workingDays: string[] | null
): boolean {
  if (!workingDays || workingDays.length === 0) {
    // Varsayılan: Pazartesi-Cuma
    const dayOfWeek = date.getDay()
    return dayOfWeek >= 1 && dayOfWeek <= 5
  }

  const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const dayName = dayNames[date.getDay()]
  
  return workingDays.includes(dayName)
}

/**
 * Bir günde bir ders sadece bir kez kontrolü
 */
export async function checkCourseOnDay(
  termId: string,
  courseId: string,
  date: Date
): Promise<boolean> {
  const existing = await prisma.dailyLesson.findFirst({
    where: {
      termId,
      courseId,
      specificDate: date,
      isCancelled: false,
    },
  })

  return existing !== null
}

/**
 * Slot dolu mu kontrolü
 */
export async function isSlotOccupied(
  termId: string,
  classId: string,
  date: Date,
  timeSlotId: string
): Promise<boolean> {
  const existing = await prisma.dailyLesson.findFirst({
    where: {
      termId,
      classId,
      specificDate: date,
      timeSlotId,
      isCancelled: false,
    },
  })

  return existing !== null
}
