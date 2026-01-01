const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔄 8. slot derslerini 7. slot\'a taşıma başlatılıyor...\n')

  // 8. slot'u bul
  const slot8 = await prisma.timeSlot.findFirst({
    where: { 
      OR: [
        { slotNumber: 8 },
        { startTime: '15:00', endTime: '15:45' }
      ]
    },
  })

  if (!slot8) {
    console.log('✓ 8. slot zaten yok, işlem gerekmiyor.')
    return
  }

  // 7. slot'u bul
  const slot7 = await prisma.timeSlot.findFirst({
    where: { slotNumber: 7 },
  })

  if (!slot7) {
    console.error('❌ 7. slot bulunamadı! İşlem iptal edildi.')
    return
  }

  console.log(`📋 8. slot (${slot8.startTime}-${slot8.endTime}) ID: ${slot8.id}`)
  console.log(`📋 7. slot (${slot7.startTime}-${slot7.endTime}) ID: ${slot7.id}`)

  // 8. slot'a bağlı dersleri say
  const lessonsCount = await prisma.dailyLesson.count({
    where: { timeSlotId: slot8.id },
  })

  console.log(`\n📊 8. slot'a bağlı ${lessonsCount} ders bulundu.`)

  if (lessonsCount === 0) {
    console.log('Ders kaydı yok, direkt silme yapılacak.')
  } else {
    console.log(`\n⏳ Dersler işleniyor (çakışma kontrolü ile)...`)
    
    // Tüm 8. slot derslerini al
    const lessons8 = await prisma.dailyLesson.findMany({
      where: { timeSlotId: slot8.id },
    })

    let movedCount = 0
    let deletedCount = 0

    for (const lesson of lessons8) {
      // Aynı gün+sınıf için 7. slot'ta ders var mı?
      const conflictingLesson = await prisma.dailyLesson.findFirst({
        where: {
          classId: lesson.classId,
          dayOfWeek: lesson.dayOfWeek,
          timeSlotId: slot7.id,
          specificDate: lesson.specificDate,
        },
      })

      if (conflictingLesson) {
        // Çakışma var, 8. slotu sil (7. zaten dolu)
        await prisma.dailyLesson.delete({
          where: { id: lesson.id },
        })
        deletedCount++
      } else {
        // Çakışma yok, 7. slot'a taşı
        await prisma.dailyLesson.update({
          where: { id: lesson.id },
          data: { timeSlotId: slot7.id },
        })
        movedCount++
      }
    }

    console.log(`✅ ${movedCount} ders 7. slot'a taşındı.`)
    console.log(`🗑️  ${deletedCount} ders silindi (7. slot'ta zaten ders vardı).`)
  }

  // Şimdi 8. slotu sil
  console.log('\n🗑️  8. slot siliniyor...')
  await prisma.timeSlot.delete({
    where: { id: slot8.id },
  })
  console.log('✅ 8. slot başarıyla silindi.')

  // Sonuçları göster
  const allSlots = await prisma.timeSlot.findMany({
    orderBy: { slotNumber: 'asc' },
  })

  console.log('\n📊 Güncel TimeSlot listesi:')
  for (const s of allSlots) {
    const lessonCount = await prisma.dailyLesson.count({
      where: { timeSlotId: s.id },
    })
    console.log(`  ${s.slotNumber}. ${s.isBreak ? 'Öğle Yemeği' : 'Ders'}: ${s.startTime}-${s.endTime} (${lessonCount} ders)`)
  }

  console.log('\n✅ Migration tamamlandı! Artık sistem 7 ders slotu ile çalışacak.')
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
