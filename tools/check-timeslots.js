const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkTimeSlots() {
  const slots = await prisma.timeSlot.findMany({
    orderBy: { slotNumber: 'asc' },
  })

  console.log('⏰ TimeSlot Tablosu:\n')
  slots.forEach(s => {
    console.log(`Slot ${s.slotNumber}: ${s.startTime}-${s.endTime} ${s.isBreak ? '(MOLA)' : '(DERS)'}`)
  })
  console.log(`\n✅ Toplam: ${slots.length} slot`)
  console.log(`📚 Ders slotları: ${slots.filter(s => !s.isBreak).length}`)
  console.log(`☕ Mola slotları: ${slots.filter(s => s.isBreak).length}`)

  await prisma.$disconnect()
}

checkTimeSlots()
