// Haftalık program test scripti
const termId = 'cmjpto8ae0000bncc1gqr5kgj'
const baseUrl = 'http://localhost:3000'

async function testGenerateAllWeeks() {
  console.log('🔄 Tüm haftalar için program oluşturuluyor...')
  
  const startTime = Date.now()
  
  try {
    const response = await fetch(`${baseUrl}/api/terms/${termId}/weekly-schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        generateAll: true,
      }),
    })

    const data = await response.json()
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    console.log(`\n✅ Başarılı! (${duration} saniye)`)
    console.log(`📊 Toplam hafta sayısı: ${data.totalWeeks}`)
    console.log(`📚 Toplam oluşturulan ders: ${data.totalCreatedLessons}`)
    console.log(`\n📋 Hafta Detayları:`)
    
    data.weekResults.forEach((week) => {
      const status = week.status === 'success' ? '✓' : '✗'
      console.log(`  ${status} Hafta ${week.weekNumber}: ${week.createdLessons} ders ${week.error ? `(Hata: ${week.error})` : ''}`)
    })

    // İlk 3 haftayı kontrol et
    console.log('\n🔍 İlk 3 hafta kontrol ediliyor...')
    for (let weekNum = 1; weekNum <= 3; weekNum++) {
      const weekResponse = await fetch(`${baseUrl}/api/terms/${termId}/weekly-schedule?weekNumber=${weekNum}`)
      const weekData = await weekResponse.json()
      
      console.log(`\nHafta ${weekNum}:`)
      console.log(`  📅 ${new Date(weekData.weekStartDate).toLocaleDateString('tr-TR')} - ${new Date(weekData.weekEndDate).toLocaleDateString('tr-TR')}`)
      console.log(`  📚 Toplam ders: ${weekData.dailyLessons.length}`)
      
      // Özel etkinlikleri göster
      const specialEvents = weekData.dailyLessons.filter(l => l.isSpecialEvent)
      if (specialEvents.length > 0) {
        console.log(`  🎯 Özel etkinlikler: ${specialEvents.length} adet`)
        const uniqueEvents = [...new Set(specialEvents.map(e => e.specialEventType))]
        console.log(`     Türler: ${uniqueEvents.join(', ')}`)
      }
      
      // Ders sayaçlarını kontrol et
      const coursesWithCounters = weekData.dailyLessons
        .filter(l => !l.isSpecialEvent && l.course)
        .reduce((acc, lesson) => {
          const key = lesson.course.name
          if (!acc[key]) {
            acc[key] = {
              count: 0,
              total: lesson.totalPlannedHours,
              occurrence: lesson.occurrenceCount,
            }
          }
          acc[key].count++
          return acc
        }, {})
      
      console.log(`  📖 Dersler:`)
      Object.entries(coursesWithCounters).forEach(([name, data]) => {
        console.log(`     ${name}: Bu hafta ${data.count}x, Toplam (${data.occurrence}/${data.total})`)
      })
    }

    return data
  } catch (error) {
    console.error('❌ Hata:', error.message)
    throw error
  }
}

async function testSingleWeek(weekNumber) {
  console.log(`\n🔄 ${weekNumber}. hafta için program oluşturuluyor...`)
  
  try {
    const response = await fetch(`${baseUrl}/api/terms/${termId}/weekly-schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        weekNumber,
      }),
    })

    const data = await response.json()
    console.log(`✅ ${data.message}`)
    console.log(`📚 Oluşturulan ders: ${data.createdLessons}`)
    
    return data
  } catch (error) {
    console.error('❌ Hata:', error.message)
    throw error
  }
}

async function testDeleteWeek(weekNumber) {
  console.log(`\n🗑️  ${weekNumber}. hafta siliniyor...`)
  
  try {
    const response = await fetch(`${baseUrl}/api/terms/${termId}/weekly-schedule?weekNumber=${weekNumber}`, {
      method: 'DELETE',
    })

    const data = await response.json()
    console.log(`✅ ${data.message}`)
    console.log(`🗑️  Silinen ders: ${data.deletedCount}`)
    
    return data
  } catch (error) {
    console.error('❌ Hata:', error.message)
    throw error
  }
}

// Test senaryosu
async function runTests() {
  console.log('🚀 Haftalık Program Algoritması Test Başlıyor...\n')
  console.log('=' .repeat(60))
  
  try {
    // Test 1: Tüm haftalar için program oluştur
    await testGenerateAllWeeks()
    
    console.log('\n' + '='.repeat(60))
    console.log('\n✅ TÜM TESTLER BAŞARILI!')
    
  } catch (error) {
    console.error('\n❌ TEST BAŞARISIZ:', error)
  }
}

runTests()
