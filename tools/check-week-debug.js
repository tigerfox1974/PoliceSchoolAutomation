const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Önce PTE-69 dönemini bul
  const term = await prisma.term.findFirst({
    where: { termCode: 'PTE-69' },
  })

  if (!term) {
    console.log('PTE-69 dönemi bulunamadı')
    return
  }

  console.log(`📋 Dönem: ${term.name} (${term.termCode})`)
  console.log(`📅 Başlangıç: ${term.startDate.toISOString().split('T')[0]}`)
  console.log(`📅 Bitiş: ${term.endDate.toISOString().split('T')[0]}`)

  // 10. ve 14. haftaların tarihlerini hesapla
  const weeks = [10, 14]

  for (const weekNum of weeks) {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`📊 ${weekNum}. HAFTA ANALİZİ`)
    console.log('='.repeat(60))

    // O haftanın başlangıç tarihini hesapla
    const weekStart = new Date(term.startDate)
    weekStart.setDate(weekStart.getDate() + (weekNum - 1) * 7)
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    console.log(`📅 Tarih Aralığı: ${weekStart.toISOString().split('T')[0]} - ${weekEnd.toISOString().split('T')[0]}`)

    // O haftanın derslerini say
    const lessons = await prisma.dailyLesson.findMany({
      where: {
        termId: term.id,
        specificDate: {
          gte: weekStart,
          lte: weekEnd,
        },
        isCancelled: false,
      },
      include: {
        course: { select: { name: true, code: true } },
        timeSlot: { select: { slotNumber: true, startTime: true } },
      },
      orderBy: [
        { specificDate: 'asc' },
        { timeSlot: { slotNumber: 'asc' } },
      ],
    })

    console.log(`\n📚 Toplam ${lessons.length} ders bulundu`)

    // Özel etkinlikleri say
    const specialEvents = lessons.filter(l => l.isSpecialEvent)
    console.log(`🎯 ${specialEvents.length} özel etkinlik`)
    console.log(`📖 ${lessons.length - specialEvents.length} normal ders`)

    // Gün bazında dağılım
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
    console.log(`\n📆 Günlük Dağılım:`)
    
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(weekStart)
      currentDay.setDate(currentDay.getDate() + i)
      
      const dayLessons = lessons.filter(l => 
        l.specificDate.toISOString().split('T')[0] === currentDay.toISOString().split('T')[0]
      )
      
      const dayName = dayNames[currentDay.getDay()]
      const dateStr = currentDay.toISOString().split('T')[0]
      
      console.log(`  ${dayName} (${dateStr}): ${dayLessons.length} ders`)
      
      // Slot bazında göster
      if (dayLessons.length > 0) {
        const slotDistribution = {}
        dayLessons.forEach(l => {
          const slot = l.timeSlot.slotNumber
          if (!slotDistribution[slot]) slotDistribution[slot] = 0
          slotDistribution[slot]++
        })
        
        const slots = Object.keys(slotDistribution).sort((a, b) => Number(a) - Number(b))
        console.log(`    Slotlar: ${slots.map(s => `${s}:${slotDistribution[s]}`).join(', ')}`)
        
        // Boş slotları tespit et (1-7 arası)
        const emptySlots = []
        for (let slot = 1; slot <= 7; slot++) {
          if (!slotDistribution[slot]) {
            emptySlots.push(slot)
          }
        }
        if (emptySlots.length > 0) {
          console.log(`    ⚠️  Boş slotlar: ${emptySlots.join(', ')}`)
        }
      }
    }

    // Aylık plan durumunu kontrol et
    const monthKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}`
    console.log(`\n💰 Aylık Plan Durumu (${monthKey}):`)

    const monthlyPlans = await prisma.monthlyCoursePlan.findMany({
      where: {
        termCoursePlan: { termId: term.id },
        month: weekStart.getMonth() + 1,
        year: weekStart.getFullYear(),
        plannedHours: { gt: 0 },
      },
      include: {
        termCoursePlan: {
          include: {
            course: { select: { name: true, code: true } },
          },
        },
      },
    })

    // Her ders için o haftaya kadar gerçekleşeni say
    for (const mp of monthlyPlans.slice(0, 5)) { // İlk 5 dersi göster
      const course = mp.termCoursePlan.course
      
      // O aya kadar bu dersin kaç saati gerçekleşmiş
      const actualInMonth = await prisma.dailyLesson.count({
        where: {
          termId: term.id,
          courseId: course.id,
          specificDate: {
            gte: new Date(mp.year, mp.month - 1, 1),
            lte: weekEnd,
          },
          isCancelled: false,
          isSpecialEvent: false,
        },
        distinct: ['specificDate'],
      })

      const remaining = Math.max(0, mp.plannedHours - actualInMonth)
      const status = remaining === 0 ? '✅' : remaining < 3 ? '⚠️' : '📈'
      
      console.log(`  ${status} ${course.name}: ${actualInMonth}/${mp.plannedHours} saat (${remaining} kaldı)`)
    }

    if (monthlyPlans.length > 5) {
      console.log(`  ... ve ${monthlyPlans.length - 5} ders daha`)
    }
  }
}

main()
  .catch((e) => {
    console.error('Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
