const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🕐 TimeSlot seed başlatılıyor...')

  // Standart KKTC Polis Okulu mesai saatleri
  const timeSlots = [
    { slotNumber: 1, startTime: '08:00', endTime: '08:45', isBreak: false },
    { slotNumber: 2, startTime: '09:00', endTime: '09:45', isBreak: false },
    { slotNumber: 3, startTime: '10:00', endTime: '10:45', isBreak: false },
    { slotNumber: 4, startTime: '11:00', endTime: '11:45', isBreak: false },
    { slotNumber: 5, startTime: '12:00', endTime: '12:45', isBreak: false },
    { slotNumber: 6, startTime: '12:45', endTime: '13:45', isBreak: true }, // Öğle yemeği
    { slotNumber: 7, startTime: '14:00', endTime: '14:45', isBreak: false },
  ]

  // Mevcut TimeSlot'ları kontrol et
  const existingSlots = await prisma.timeSlot.findMany()
  
  if (existingSlots.length > 0) {
    console.log(`⚠️  ${existingSlots.length} TimeSlot zaten mevcut. Güncelleniyor...`)
    
    // Mevcut slot'ları güncelle veya yeni ekle
    for (const slot of timeSlots) {
      const existing = existingSlots.find(
        s => s.startTime === slot.startTime && s.endTime === slot.endTime
      )
      
      if (existing) {
        await prisma.timeSlot.update({
          where: { id: existing.id },
          data: {
            slotNumber: slot.slotNumber,
            isBreak: slot.isBreak,
          },
        })
        console.log(`✅ Güncellendi: ${slot.slotNumber}. Ders (${slot.startTime} - ${slot.endTime})`)
      } else {
        await prisma.timeSlot.create({
          data: slot,
        })
        console.log(`✅ Eklendi: ${slot.slotNumber}. Ders (${slot.startTime} - ${slot.endTime})`)
      }
    }
  } else {
    // Yeni slot'ları oluştur
    for (const slot of timeSlots) {
      await prisma.timeSlot.create({
        data: slot,
      })
      console.log(`✅ Oluşturuldu: ${slot.slotNumber}. ${slot.isBreak ? 'Öğle Yemeği' : 'Ders'} (${slot.startTime} - ${slot.endTime})`)
    }
  }

  console.log('\n✅ TimeSlot seed tamamlandı!')
  console.log(`📊 Toplam ${timeSlots.length} TimeSlot hazır.`)
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

