const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkMonthlyPlans() {
  try {
    console.log('\n🔍 Checking MonthlyCoursePlan data...\n')
    
    // Get term
    const term = await prisma.term.findFirst({
      where: {
        id: 'cmjpto8ae0000bncc1gqr5kgj'
      }
    })
    
    if (!term) {
      console.log('❌ Term not found!')
      return
    }
    
    console.log(`✅ Term: ${term.name}`)
    console.log(`   Start: ${term.startDate.toISOString().split('T')[0]}`)
    console.log(`   End: ${term.endDate.toISOString().split('T')[0]}`)
    
    // Check TermCoursePlan
    const termCoursePlans = await prisma.termCoursePlan.findMany({
      where: { termId: term.id },
      include: {
        course: true
      }
    })
    
    console.log(`\n📋 TermCoursePlan count: ${termCoursePlans.length}`)
    if (termCoursePlans.length > 0) {
      console.log('   First 3 courses:')
      termCoursePlans.slice(0, 3).forEach(tcp => {
        console.log(`   - ${tcp.course.name}: ${tcp.totalPlannedHours} hours`)
      })
    }
    
    // Check MonthlyCoursePlan for January 2026 (week 1 starts 26 Ocak)
    const monthlyPlans = await prisma.monthlyCoursePlan.findMany({
      where: {
        termCoursePlan: {
          termId: term.id
        },
        month: 1, // January
        year: 2026
      },
      include: {
        termCoursePlan: {
          include: {
            course: true
          }
        }
      }
    })
    
    console.log(`\n📅 MonthlyCoursePlan for January 2026: ${monthlyPlans.length}`)
    if (monthlyPlans.length > 0) {
      console.log('   First 5 courses:')
      monthlyPlans.slice(0, 5).forEach(mp => {
        console.log(`   - ${mp.termCoursePlan.course.name}: ${mp.plannedHours} hours`)
      })
    } else {
      console.log('   ❌ NO MONTHLY PLANS FOUND FOR JANUARY 2026!')
      console.log('   This is why normal courses are not scheduled!')
    }
    
    // Check all months that have plans
    const allMonthlyPlans = await prisma.monthlyCoursePlan.findMany({
      where: {
        termCoursePlan: {
          termId: term.id
        }
      },
      select: {
        month: true,
        year: true
      },
      distinct: ['month', 'year']
    })
    
    console.log(`\n📊 Available months with plans:`)
    if (allMonthlyPlans.length > 0) {
      const monthNames = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
      allMonthlyPlans.forEach(mp => {
        console.log(`   - ${monthNames[mp.month]} ${mp.year}`)
      })
    } else {
      console.log('   ❌ NO MONTHLY PLANS AT ALL!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkMonthlyPlans()
