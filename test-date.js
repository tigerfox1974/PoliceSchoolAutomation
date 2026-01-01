const date = new Date('2026-02-08') // 2. hafta başlangıcı
console.log('Week start:', date.toISOString())
console.log('Month (0-indexed):', date.getMonth())
console.log('Month (1-indexed):', date.getMonth() + 1)
console.log('Year:', date.getFullYear())

// MonthlyCoursePlan'da ne arıyor?
console.log('\nQuery will search for:')
console.log('month:', date.getMonth() + 1)  // 2 (Şubat)
console.log('year:', date.getFullYear())     // 2026
