/**
 * Eşit dağılım mantığı
 * Aylık plan verilerinden haftalık saat hesaplamaları
 */

/**
 * Ayın toplam hafta sayısını hesapla
 * Dönem sınırlarını da dikkate alır
 */
export function calculateWeeksInMonth(
  monthStartDate: Date,
  monthEndDate: Date,
  termStartDate: Date,
  termEndDate: Date
): number {
  // Ayın ilk Pazartesi'sini bul
  const firstDayOfWeek = monthStartDate.getDay() // 0 = Pazar, 1 = Pazartesi
  const daysToMonday = firstDayOfWeek === 0 ? -6 : 1 - firstDayOfWeek
  const firstMonday = new Date(monthStartDate)
  firstMonday.setDate(monthStartDate.getDate() + daysToMonday)
  firstMonday.setHours(0, 0, 0, 0)

  // Ayın son Pazar'ını bul
  const lastDayOfWeek = monthEndDate.getDay()
  const daysToSunday = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek
  const lastSunday = new Date(monthEndDate)
  lastSunday.setDate(monthEndDate.getDate() + daysToSunday)
  lastSunday.setHours(23, 59, 59, 999)

  // Dönem sınırlarını kontrol et
  const actualStart = firstMonday < termStartDate ? termStartDate : firstMonday
  const actualEnd = lastSunday > termEndDate ? termEndDate : lastSunday

  // Hafta sayısını hesapla
  const weeks = Math.ceil((actualEnd.getTime() - actualStart.getTime()) / (7 * 24 * 60 * 60 * 1000))
  return Math.max(1, weeks) // En az 1 hafta
}

/**
 * Kalan hafta sayısını hesapla (dönem bitimine kadar)
 */
export function calculateRemainingWeeks(
  currentWeekEndDate: Date,
  termEndDate: Date
): number {
  const termEnd = new Date(termEndDate)
  termEnd.setHours(23, 59, 59, 999)

  // Kalan gün sayısını hesapla
  const remainingDays = Math.ceil(
    (termEnd.getTime() - currentWeekEndDate.getTime()) / (24 * 60 * 60 * 1000)
  )
  
  // Hafta sayısına çevir
  const remainingWeeks = Math.ceil(remainingDays / 7)
  return Math.max(1, remainingWeeks) // En az 1 hafta
}

/**
 * Eşit dağılım için haftalık saat hesapla
 * Kalan saat / Kalan hafta mantığı
 */
export function calculateWeeklyHours(
  remainingHours: number,
  remainingWeeks: number
): number {
  if (remainingHours <= 0) return 0
  if (remainingWeeks <= 0) return remainingHours

  // Eşit dağılım için yukarı yuvarlama
  const weeklyHours = Math.ceil(remainingHours / remainingWeeks)
  
  // Kalan saatten fazla olamaz
  return Math.max(0, Math.min(weeklyHours, remainingHours))
}

/**
 * Aylık plandan haftalık saat hesapla (basit yöntem)
 * Sadece o ay için kullanılır
 */
export function calculateWeeklyHoursFromMonthly(
  monthlyPlannedHours: number,
  weeksInMonth: number
): number {
  if (monthlyPlannedHours <= 0 || weeksInMonth <= 0) return 0

  // Aylık planlanan saat / ay içindeki hafta sayısı
  const weeklyHours = Math.ceil(monthlyPlannedHours / weeksInMonth)
  return Math.max(0, weeklyHours)
}

/**
 * Dersleri önceliğe göre sırala
 * Kalan saati fazla olanlar önce (eşit dağılım için)
 */
export function sortCoursesByPriority<T extends { remainingHours: number }>(
  courses: T[]
): T[] {
  return [...courses].sort((a, b) => {
    // Kalan saati fazla olan önce
    if (b.remainingHours !== a.remainingHours) {
      return b.remainingHours - a.remainingHours
    }
    return 0
  })
}
