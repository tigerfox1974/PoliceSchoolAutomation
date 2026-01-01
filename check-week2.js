const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkWeek2() {
  try {
    const termId = 'cmjpto8ae0000bncc1gqr5kgj'
    
    console.log('\n🔍 Checking Week 2 data...\n')
    
    // Week 2 date range: 8-15 Şubat 2026
    const weekStartDate = new Date('2026-02-08')
    const weekEndDate = new Date('2026-02-15')
    weekEndDate.setHours(23, 59, 59, 999)
    
    console.log(`Week 2: ${weekStartDate.toISOString().split('T')[0]} to ${weekEndDate.toISOString().split('T')[0]}`)
    
    // Check DailyLessons for week 2
    const lessons = await prisma.dailyLesson.findMany({
      where: {
        termId,
        specificDate: {
          gte: weekStartDate,
          lte: weekEndDate
        }
      },
      include: {
        course: true,
        timeSlot: true
      },
      orderBy: [
        { specificDate: 'asc' },
        { timeSlot: { slotNumber: 'asc' } }
      ]
    })
    
    console.log(`\n📊 Total lessons in Week 2: ${lessons.length}`)
    
    // Group by date
    const byDate = {}
    lessons.forEach(lesson => {
      const date = lesson.specificDate.toISOString().split('T')[0]
      if (!byDate[date]) byDate[date] = []
      byDate[date].push(lesson)
    })
    
    console.log('\n📅 Breakdown by date:')
    Object.keys(byDate).sort().forEach(date => {
      const dayLessons = byDate[date]
      const specialEvents = dayLessons.filter(l => l.isSpecialEvent).length
      const normalLessons = dayLessons.filter(l => !l.isSpecialEvent).length
      console.log(`${date}: ${dayLessons.length} total (${normalLessons} normal, ${specialEvents} special)`)
      
      dayLessons.forEach(l => {
        const type = l.isSpecialEvent ? '🎯 SPECIAL' : '📚 NORMAL'
        console.log(`  ${type} Slot ${l.timeSlot.slotNumber}: ${l.course?.name || 'Unknown'}`)
      })
    })
    
    // Check MonthlyCoursePlan for February
    const monthlyPlans = await prisma.monthlyCoursePlan.findMany({
      where: {
        termCoursePlan: {
          termId
        },
        month: 2,
        year: 2026,
        plannedHours: { gt: 0 }
      },
      include: {
        termCoursePlan: {
          include: {
            course: true
          }
        }
      }
    })
    
    console.log(`\n📋 MonthlyCoursePlans for February: ${monthlyPlans.length}`)
    if (monthlyPlans.length > 0) {
      console.log('First 5 courses:')
      monthlyPlans.slice(0, 5).forEach(mp => {
        console.log(`  - ${mp.termCoursePlan.course.name}: ${mp.plannedHours} hours planned`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkWeek2()
