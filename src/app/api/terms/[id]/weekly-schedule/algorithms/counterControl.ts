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
  weekEndDate: Date
): Promise<{ canSchedule: boolean; remainingHours: number; occurrenceCount: number }> {
  // Dönem başından bu haftanın sonuna kadar kaç kez yazılmış?
  const occurrenceCount = await prisma.dailyLesson.count({
    where: {
      termId,
      courseId,
      specificDate: { lte: weekEndDate },
      isCancelled: false,
    },
  })

  const remainingHours = totalPlannedHours - occurrenceCount

  return {
    canSchedule: remainingHours > 0,
    remainingHours: Math.max(0, remainingHours),
    occurrenceCount,
  }
}

/**
 * Tüm derslerin sayaç bilgilerini toplu getir (performans için)
 */
export async function getCourseCounters(
  termId: string,
  weekEndDate: Date,
  courseIds: string[]
): Promise<Map<string, { occurrenceCount: number; remainingHours: number }>> {
  const counters = new Map<string, { occurrenceCount: number; remainingHours: number }>()

  // Her ders için ayrı sorgu yerine tek sorguda gruplayarak al
  const results = await prisma.dailyLesson.groupBy({
    by: ['courseId'],
    where: {
      termId,
      courseId: { in: courseIds },
      specificDate: { lte: weekEndDate },
      isCancelled: false,
    },
    _count: {
      id: true,
    },
  })

  // Sonuçları map'e dönüştür
  results.forEach((result) => {
    if (result.courseId) {
      counters.set(result.courseId, {
        occurrenceCount: result._count.id,
        remainingHours: 0, // Bu değer dışarıdan set edilecek (totalPlannedHours bilinmiyor)
      })
    }
  })

  return counters
}
