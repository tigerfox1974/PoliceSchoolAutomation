const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkSlots() {
  try {
    // Check TimeSlots
    const timeSlots = await prisma.timeSlot.findMany({
      orderBy: { slotNumber: 'asc' }
    })
    
    console.log('\n⏰ TimeSlots in database:')
    timeSlots.forEach(ts => {
      console.log(`  Slot ${ts.slotNumber}: ${ts.startTime} - ${ts.endTime}`)
    })
    
    // Check Week 2 - Çarşamba 10 Şubat
    const wednesday = new Date('2026-02-10')
    const lessons = await prisma.dailyLesson.findMany({
      where: {
        specificDate: wednesday
      },
      include: {
        course: true,
        timeSlot: true,
        specialEvent: true
      },
      orderBy: {
        timeSlot: { slotNumber: 'asc' }
      }
    })
    
    console.log(`\n📅 Çarşamba 10 Şubat 2026 - Total lessons: ${lessons.length}`)
    
    // Group by slot
    const bySlot = {}
    lessons.forEach(l => {
      const slotNum = l.timeSlot.slotNumber
      if (!bySlot[slotNum]) bySlot[slotNum] = []
      bySlot[slotNum].push(l)
    })
    
    Object.keys(bySlot).sort((a, b) => parseInt(a) - parseInt(b)).forEach(slotNum => {
      const slotLessons = bySlot[slotNum]
      console.log(`\n  Slot ${slotNum}: ${slotLessons.length} lessons`)
      slotLessons.forEach(l => {
        const name = l.course?.name || l.specialEvent?.eventTitle || 'Unknown'
        const type = l.isSpecialEvent ? '🎯 SPECIAL' : '📚 NORMAL'
        const className = l.class?.code || 'N/A'
        console.log(`    ${type} - Class ${className}: ${name}`)
      })
    })
    
    // Check Cuma 12 Şubat
    const friday = new Date('2026-02-12')
    const fridayLessons = await prisma.dailyLesson.findMany({
      where: {
        specificDate: friday
      },
      include: {
        course: true,
        timeSlot: true,
        specialEvent: true,
        class: true
      },
      orderBy: {
        timeSlot: { slotNumber: 'asc' }
      }
    })
    
    console.log(`\n📅 Cuma 12 Şubat 2026 - Total lessons: ${fridayLessons.length}`)
    
    const bySlotFriday = {}
    fridayLessons.forEach(l => {
      const slotNum = l.timeSlot.slotNumber
      if (!bySlotFriday[slotNum]) bySlotFriday[slotNum] = []
      bySlotFriday[slotNum].push(l)
    })
    
    Object.keys(bySlotFriday).sort((a, b) => parseInt(a) - parseInt(b)).forEach(slotNum => {
      const slotLessons = bySlotFriday[slotNum]
      console.log(`\n  Slot ${slotNum}: ${slotLessons.length} lessons`)
      slotLessons.forEach(l => {
        const name = l.course?.name || l.specialEvent?.eventTitle || 'Unknown'
        const type = l.isSpecialEvent ? '🎯 SPECIAL' : '📚 NORMAL'
        const className = l.class?.code || 'N/A'
        console.log(`    ${type} - Class ${className}: ${name}`)
      })
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkSlots()
