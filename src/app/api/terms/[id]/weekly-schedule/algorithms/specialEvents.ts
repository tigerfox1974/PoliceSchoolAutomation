import { prisma } from '@/lib/prisma'
import { DayOfWeek, SpecialEventType } from '@prisma/client'

/**
 * Özel etkinlikleri haftalık programa ekle
 * - İntibak Eğitimi (İlk hafta, tüm hafta)
 * - Müdüriyet (Her Cuma 7. ders)
 * - Sosyal ve Sportif Faaliyetler (Her Çarşamba 6-7. ders)
 * - Beden Eğitimi Önceliği (Her Perşembe 6-7. ders)
 */

interface SpecialEventOptions {
  termId: string
  weekNumber: number
  weekStartDate: Date
  weekEndDate: Date
  classes: Array<{ id: string; code: string }>
  timeSlots: Array<{ id: string; slotNumber: number; startTime: string; endTime: string }>
}

interface DailyLessonCreate {
  termId: string
  classId: string
  courseId: string | null
  instructorId: string | null
  dayOfWeek: DayOfWeek
  timeSlotId: string
  specificDate: Date
  isSpecialEvent: boolean
  specialEventType?: SpecialEventType
  specialEventId?: string
  specialEventTitle?: string
  requiresInstructor: boolean
}

/**
 * İlk hafta: İntibak Eğitimi
 * Tüm hafta boyunca tüm saatlerde (7 gün x 7 ders)
 */
export async function createOrientationWeek(
  options: SpecialEventOptions
): Promise<DailyLessonCreate[]> {
  const { termId, weekNumber, weekStartDate, weekEndDate, classes, timeSlots } = options

  // Sadece 1. hafta
  if (weekNumber !== 1) return []

  const lessons: DailyLessonCreate[] = []

  // İntibak SpecialEvent'ini kontrol et veya oluştur
  let orientationEvent = await prisma.specialEvent.findFirst({
    where: { eventType: 'ORIENTATION' },
  })

  if (!orientationEvent) {
    orientationEvent = await prisma.specialEvent.create({
      data: {
        eventType: 'ORIENTATION',
        eventTitle: 'İntibak Eğitimi',
        description: 'Yeni öğrencilerin okula uyum sağlaması için ilk hafta eğitimi',
        duration: 35, // 7 gün x 5 ders = 35 saat (Cumartesi-Pazar hariç)
        requiresInstructor: false,
        allClassesTogether: true,
        countsTowardCurriculum: false,
      },
    })
  }

  // 7 gün için (Pazartesi-Pazar)
  for (let day = 0; day < 7; day++) {
    const currentDate = new Date(weekStartDate)
    currentDate.setDate(weekStartDate.getDate() + day)

    const dayOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][
      currentDate.getDay()
    ] as DayOfWeek

    // Her sınıf için
    for (const classItem of classes) {
      // Her ders saati için
      for (const slot of timeSlots) {
        lessons.push({
          termId,
          classId: classItem.id,
          courseId: null,
          instructorId: null,
          dayOfWeek,
          timeSlotId: slot.id,
          specificDate: currentDate,
          isSpecialEvent: true,
          specialEventType: 'ORIENTATION',
          specialEventId: orientationEvent.id,
          specialEventTitle: 'İntibak Eğitimi',
          requiresInstructor: false,
        })
      }
    }
  }

  return lessons
}

/**
 * Her Cuma 7. ders: Müdüriyet
 */
export async function createManagementHours(
  options: SpecialEventOptions
): Promise<DailyLessonCreate[]> {
  const { termId, weekStartDate, classes, timeSlots } = options

  const lessons: DailyLessonCreate[] = []

  // Cuma gününü bul
  let friday = new Date(weekStartDate)
  while (friday.getDay() !== 5) {
    friday.setDate(friday.getDate() + 1)
  }

  // 7. ders slotunu bul
  const slot7 = timeSlots.find((s) => s.slotNumber === 7)
  if (!slot7) return []

  // Müdüriyet SpecialEvent'ini kontrol et veya oluştur
  let managementEvent = await prisma.specialEvent.findFirst({
    where: { eventType: 'MANAGEMENT' },
  })

  if (!managementEvent) {
    managementEvent = await prisma.specialEvent.create({
      data: {
        eventType: 'MANAGEMENT',
        eventTitle: 'Haftalık Müdüriyet Toplantısı',
        description: 'Okul yönetimi ve öğrenci temsilcilerinin haftalık toplantısı',
        duration: 1,
        dayOfWeek: 5, // Cuma
        slotIndex: 7,
        requiresInstructor: false,
        allClassesTogether: true,
        countsTowardCurriculum: false,
      },
    })
  }

  // Her sınıf için
  for (const classItem of classes) {
    lessons.push({
      termId,
      classId: classItem.id,
      courseId: null,
      instructorId: null,
      dayOfWeek: 'FRIDAY',
      timeSlotId: slot7.id,
      specificDate: friday,
      isSpecialEvent: true,
      specialEventType: 'MANAGEMENT',
      specialEventId: managementEvent.id,
      specialEventTitle: 'Haftalık Müdüriyet',
      requiresInstructor: false,
    })
  }

  return lessons
}

/**
 * Her Çarşamba 6-7. ders: Sosyal ve Sportif Faaliyetler
 */
export async function createSocialSportsHours(
  options: SpecialEventOptions
): Promise<DailyLessonCreate[]> {
  const { termId, weekStartDate, classes, timeSlots } = options

  const lessons: DailyLessonCreate[] = []

  // Çarşamba gününü bul
  let wednesday = new Date(weekStartDate)
  while (wednesday.getDay() !== 3) {
    wednesday.setDate(wednesday.getDate() + 1)
  }

  // 6. ve 7. ders slotlarını bul
  const slot6 = timeSlots.find((s) => s.slotNumber === 6)
  const slot7 = timeSlots.find((s) => s.slotNumber === 7)
  if (!slot6 || !slot7) return []

  // Sosyal/Sportif SpecialEvent'ini kontrol et veya oluştur
  let socialSportsEvent = await prisma.specialEvent.findFirst({
    where: { eventType: 'SOCIAL_SPORTS' },
  })

  if (!socialSportsEvent) {
    socialSportsEvent = await prisma.specialEvent.create({
      data: {
        eventType: 'SOCIAL_SPORTS',
        eventTitle: 'Sosyal ve Sportif Faaliyetler',
        description: 'Öğrencilerin sosyal ve sportif aktiviteler yapması için ayrılan zaman',
        duration: 2, // Çift ders
        dayOfWeek: 3, // Çarşamba
        slotIndex: 6,
        requiresInstructor: false,
        allClassesTogether: false,
        countsTowardCurriculum: false,
      },
    })
  }

  // Her sınıf için, 6. ve 7. ders
  for (const classItem of classes) {
    for (const slot of [slot6, slot7]) {
      lessons.push({
        termId,
        classId: classItem.id,
        courseId: null,
        instructorId: null,
        dayOfWeek: 'WEDNESDAY',
        timeSlotId: slot.id,
        specificDate: wednesday,
        isSpecialEvent: true,
        specialEventType: 'SOCIAL_SPORTS',
        specialEventId: socialSportsEvent.id,
        specialEventTitle: 'Sosyal ve Sportif Faaliyetler',
        requiresInstructor: false,
      })
    }
  }

  return lessons
}

/**
 * Tüm özel etkinlikleri oluştur
 */
export async function createAllSpecialEvents(
  options: SpecialEventOptions
): Promise<DailyLessonCreate[]> {
  const lessons: DailyLessonCreate[] = []

  // 1. İlk hafta: İntibak Eğitimi
  const orientation = await createOrientationWeek(options)
  lessons.push(...orientation)

  // İlk haftaysa, diğer etkinlikleri ekleme (tüm hafta intibak)
  if (options.weekNumber === 1) {
    return lessons
  }

  // 2. Müdüriyet (Her Cuma 7. ders)
  const management = await createManagementHours(options)
  lessons.push(...management)

  // 3. Sosyal ve Sportif (Her Çarşamba 6-7. ders)
  const socialSports = await createSocialSportsHours(options)
  lessons.push(...socialSports)

  return lessons
}

/**
 * Beden Eğitimi slotlarını rezerve et (Perşembe 6-7. ders)
 * Bu slotlar dolu olarak işaretlenecek, diğer dersler yazılamayacak
 */
export function getPhysicalEducationReservedSlots(
  weekStartDate: Date,
  timeSlots: Array<{ id: string; slotNumber: number }>
): Array<{ date: Date; slotId: string }> {
  const reserved: Array<{ date: Date; slotId: string }> = []

  // Perşembe gününü bul
  let thursday = new Date(weekStartDate)
  while (thursday.getDay() !== 4) {
    thursday.setDate(thursday.getDate() + 1)
  }

  // 6. ve 7. ders slotlarını bul
  const slot6 = timeSlots.find((s) => s.slotNumber === 6)
  const slot7 = timeSlots.find((s) => s.slotNumber === 7)

  if (slot6) reserved.push({ date: new Date(thursday), slotId: slot6.id })
  if (slot7) reserved.push({ date: new Date(thursday), slotId: slot7.id })

  return reserved
}
