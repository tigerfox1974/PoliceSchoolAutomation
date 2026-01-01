/**
 * FAZ 1B Test: Boş Slot Filler Mekanizması
 * 
 * Bu script haftalık programdaki boş slotları kontrol eder ve
 * filler mekanizmasının çalışıp çalışmadığını doğrular.
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkEmptySlots() {
  try {
    console.log('🔍 FAZ 1B TEST: BOŞ SLOT KONTROLÜ\n')

    // PTE-69 dönemini al
    const term = await prisma.term.findFirst({
      where: { termCode: 'PTE-69' },
      include: {
        settings: true,
        classes: true,
      },
    })

    if (!term) {
      console.log('❌ PTE-69 dönemi bulunamadı')
      return
    }

    console.log(`✅ Dönem: ${term.name} (${term.code})`)
    console.log(`📅 Tarih Aralığı: ${term.startDate.toISOString().split('T')[0]} → ${term.endDate.toISOString().split('T')[0]}`)
    console.log(`👥 Sınıf Sayısı: ${term.classes.length}\n`)

    // TimeSlot'ları al
    const timeSlots = await prisma.timeSlot.findMany({
      where: { isBreak: false },
      orderBy: { slotNumber: 'asc' },
    })

    console.log(`⏰ Ders Saatleri: ${timeSlots.length} slot\n`)

    // Working days
    const workingDays = term.settings?.workingDays || ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
    console.log(`🗓️  Çalışma Günleri: ${workingDays.length} gün/hafta\n`)

    // Her hafta için kontrol
    const totalWeeks = Math.ceil((term.endDate.getTime() - term.startDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
    
    let totalEmptySlots = 0
    let totalFillerSlots = 0
    let weeklyStats = []

    for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
      // Haftanın tarihleri
      const startDate = new Date(term.startDate)
      const startDayOfWeek = startDate.getDay()
      const daysToMonday = startDayOfWeek === 0 ? -6 : 1 - startDayOfWeek
      const firstMonday = new Date(startDate)
      firstMonday.setDate(startDate.getDate() + daysToMonday)
      
      const weekStartDate = new Date(firstMonday)
      weekStartDate.setDate(firstMonday.getDate() + (weekNum - 1) * 7)
      
      const weekEndDate = new Date(weekStartDate)
      weekEndDate.setDate(weekStartDate.getDate() + 6)

      // Bu haftanın derslerini al
      const lessons = await prisma.dailyLesson.findMany({
        where: {
          termId: term.id,
          specificDate: {
            gte: weekStartDate,
            lte: weekEndDate,
          },
          isCancelled: false,
        },
        include: {
          course: true,
          timeSlot: true,
        },
      })

      // Filler (Müdüriyet Saati) sayısı
      const fillerLessons = lessons.filter(l => 
        l.isSpecialEvent && 
        (l.eventType === 'ADMINISTRATIVE_HOUR' || l.eventType === 'MANAGEMENT' || l.eventTitle?.includes('Müdüriyet'))
      )

      // Beklenen total slot sayısı (sınıf × gün × slot)
      const expectedSlots = term.classes.length * workingDays.length * timeSlots.length
      
      // Gerçek slot sayısı (distinct: tarih + slot + sınıf)
      const uniqueSlots = new Set()
      lessons.forEach(l => {
        if (l.specificDate && l.timeSlotId && l.classId) {
          uniqueSlots.add(`${l.specificDate.toISOString()}_${l.timeSlotId}_${l.classId}`)
        }
      })

      const actualSlots = uniqueSlots.size
      const emptySlots = expectedSlots - actualSlots

      totalEmptySlots += emptySlots
      totalFillerSlots += fillerLessons.length

      weeklyStats.push({
        weekNum,
        expectedSlots,
        actualSlots,
        emptySlots,
        fillerCount: fillerLessons.length,
        fillRate: ((actualSlots / expectedSlots) * 100).toFixed(1) + '%',
      })

      // İlk 3 ve son 3 haftayı detaylı göster
      if (weekNum <= 3 || weekNum >= totalWeeks - 2) {
        console.log(`📊 HAFTA ${weekNum}:`)
        console.log(`   Beklenen: ${expectedSlots} slot`)
        console.log(`   Gerçek: ${actualSlots} slot`)
        console.log(`   Boş: ${emptySlots} slot ${emptySlots > 0 ? '⚠️' : '✅'}`)
        console.log(`   Filler: ${fillerLessons.length} slot ${fillerLessons.length > 0 ? '🔧' : ''}`)
        console.log(`   Doluluk: ${((actualSlots / expectedSlots) * 100).toFixed(1)}%\n`)
      }
    }

    // Özet
    console.log('\n' + '='.repeat(60))
    console.log('📈 GENEL ÖZET')
    console.log('='.repeat(60))
    console.log(`🗓️  Toplam Hafta: ${totalWeeks}`)
    console.log(`📊 Toplam Boş Slot: ${totalEmptySlots} ${totalEmptySlots === 0 ? '✅ MÜKEMMEL!' : '⚠️'}`)
    console.log(`🔧 Toplam Filler Slot: ${totalFillerSlots}`)
    console.log(`🎯 Altın Kural: ${totalEmptySlots === 0 ? '✅ UYGULUYOR' : '❌ UYGULAMIYOR'}`)

    // En çok boş slot olan haftalar
    const topEmptyWeeks = weeklyStats
      .filter(w => w.emptySlots > 0)
      .sort((a, b) => b.emptySlots - a.emptySlots)
      .slice(0, 5)

    if (topEmptyWeeks.length > 0) {
      console.log('\n⚠️  EN ÇOK BOŞ SLOT OLAN HAFTALAR:')
      topEmptyWeeks.forEach(w => {
        console.log(`   Hafta ${w.weekNum}: ${w.emptySlots} boş slot (Doluluk: ${w.fillRate})`)
      })
    }

    // Filler kullanımı
    const topFillerWeeks = weeklyStats
      .filter(w => w.fillerCount > 0)
      .sort((a, b) => b.fillerCount - a.fillerCount)
      .slice(0, 5)

    if (topFillerWeeks.length > 0) {
      console.log('\n🔧 EN ÇOK FİLLER KULLANILAN HAFTALAR:')
      topFillerWeeks.forEach(w => {
        console.log(`   Hafta ${w.weekNum}: ${w.fillerCount} filler slot`)
      })
    }

    // Ders dağılımı
    const courseStats = await prisma.dailyLesson.groupBy({
      by: ['courseId', 'isSpecialEvent'],
      where: {
        termId: term.id,
        isCancelled: false,
      },
      _count: true,
    })

    const normalCourses = courseStats.filter(s => !s.isSpecialEvent).length
    const specialEvents = courseStats.filter(s => s.isSpecialEvent).length

    console.log('\n📚 DERS DAĞILIMI:')
    console.log(`   Normal Dersler: ${normalCourses} farklı ders`)
    console.log(`   Özel Etkinlikler: ${specialEvents} farklı etkinlik`)

    console.log('\n✅ Test tamamlandı!\n')

  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkEmptySlots()
