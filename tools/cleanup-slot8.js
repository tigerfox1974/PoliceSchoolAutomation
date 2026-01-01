const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  8. TimeSlot temizleniyor...')

  // 8. slot'u bul ve sil
  const slot8 = await prisma.timeSlot.findFirst({
    where: { 
      OR: [
        { slotNumber: 8 },
        { startTime: '15:00', endTime: '15:45' }
      ]
    },
  })

  if (slot8) {
    // Önce bu slota bağlı dailyLesson var mı kontrol et
    const lessonsCount = await prisma.dailyLesson.count({
      where: { timeSlotId: slot8.id },
    })

    if (lessonsCount > 0) {
      console.log(`⚠️  Bu slot'a bağlı ${lessonsCount} ders kaydı var, silinemiyor!`)
      console.log(`Bu dersleri başka slot'lara taşımanız veya silmeniz gerekiyor.`)
    } else {
      await prisma.timeSlot.delete({
        where: { id: slot8.id },
      })
      console.log(`✅ 8. slot silindi (${slot8.startTime} - ${slot8.endTime})`)
    }
  } else {
    console.log('✓ 8. slot zaten yok')
  }

  // Mevcut slot'ları göster
  const allSlots = await prisma.timeSlot.findMany({
    orderBy: { slotNumber: 'asc' },
  })
  console.log('\n📊 Mevcut TimeSlot\'lar:')
  allSlots.forEach(s => {
    console.log(`  ${s.slotNumber}. ${s.isBreak ? 'Öğle Yemeği' : 'Ders'}: ${s.startTime} - ${s.endTime}`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
