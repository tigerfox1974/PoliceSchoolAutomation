import { prisma } from '@/lib/prisma'

/**
 * Ders sayaç kontrolü
 * Her ders için dönem başından itibaren kaç kez yazıldığını kontrol eder
 * Toplam planlanan saate ulaşılmışsa false döner
 */
export async function checkCourseCounter(
  termId: string,
  courseId: string,
  totalPlannedHours: number,
  weekStartDate: Date
): Promise<{ canSchedule: boolean; remainingHours: number; occurrenceCount: number }> {
  // Dönem başından bu haftanın BAŞINA kadar (şu anki hafta HARİÇ) kaç kez yazılmış?
  // AYNİ GÜN AYNİ DERS = 1 ders say (kaç sınıfa verilirse verilsin)
  const previousDay = new Date(weekStartDate)
  previousDay.setDate(previousDay.getDate() - 1)
  previousDay.setHours(23, 59, 59, 999)
  
  // DISTINCT tarihler say - aynı gün birden fazla sınıfa verilse bile 1 kez say
  const lessons = await prisma.dailyLesson.findMany({
    where: {
      termId,
      courseId,
      specificDate: { lte: previousDay },
      isCancelled: false,
    },
    select: {
      specificDate: true,
    },
    distinct: ['specificDate'],
  })
  
  const occurrenceCount = lessons.length

  const remainingHours = totalPlannedHours - occurrenceCount

  return {
    canSchedule: remainingHours > 0,
    remainingHours: Math.max(0, remainingHours),
    occurrenceCount,
  }
}

/**
 * AYLIK BAZLI sayaç - O ay içinde kaç ders verildiğini sayar
 */
export async function getMonthlyCounters(
  termId: string,
  weekStartDate: Date,
  courseIds: string[],
  month: number,
  year: number
): Promise<Map<string, number>> {
  const counters = new Map<string, number>()

  // Ayın başı ve bu haftanın başından önceki gün
  const monthStart = new Date(year, month - 1, 1)
  monthStart.setHours(0, 0, 0, 0)
  
  const previousDay = new Date(weekStartDate)
  previousDay.setDate(previousDay.getDate() - 1)
  previousDay.setHours(23, 59, 59, 999)

  // Her ders için O AY içinde kaç kez verildiğini say
  for (const courseId of courseIds) {
    const lessons = await prisma.dailyLesson.findMany({
      where: {
        termId,
        courseId,
        specificDate: { 
          gte: monthStart,
          lte: previousDay 
        },
        isCancelled: false,
        isSpecialEvent: false,
      },
      select: {
        specificDate: true,
      },
      distinct: ['specificDate'],
    })
    
    counters.set(courseId, lessons.length)
  }

  return counters
}

/**
 * Tüm derslerin sayaç bilgilerini toplu getir (performans için)
 */
export async function getCourseCounters(
  termId: string,
  weekStartDate: Date,
  courseIds: string[]
): Promise<Map<string, { occurrenceCount: number; remainingHours: number }>> {
  const counters = new Map<string, { occurrenceCount: number; remainingHours: number }>()

  // Şu anki haftanın başından ÖNCESİNİ al (geçmiş haftalar)
  const previousDay = new Date(weekStartDate)
  previousDay.setDate(previousDay.getDate() - 1)
  previousDay.setHours(23, 59, 59, 999)

  // Her ders için ayrı sorgu - DISTINCT tarihler say
  for (const courseId of courseIds) {
    const lessons = await prisma.dailyLesson.findMany({
      where: {
        termId,
        courseId,
        specificDate: { lte: previousDay },
        isCancelled: false,
      },
      select: {
        specificDate: true,
      },
      distinct: ['specificDate'],
    })
    
    counters.set(courseId, {
      occurrenceCount: lessons.length,
      remainingHours: 0,
    })
  }

  return counters
}
