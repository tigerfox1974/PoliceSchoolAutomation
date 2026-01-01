const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createFebruaryPlans() {
  try {
    const termId = 'cmjpto8ae0000bncc1gqr5kgj'
    
    console.log('\n📅 Creating MonthlyCoursePlans for February 2026...\n')
    
    // Get all TermCoursePlans
    const termCoursePlans = await prisma.termCoursePlan.findMany({
      where: { termId },
      include: { course: true }
    })
    
    console.log(`Found ${termCoursePlans.length} TermCoursePlans`)
    
    // Delete existing February plans (if any)
    const deleted = await prisma.monthlyCoursePlan.deleteMany({
      where: {
        termCoursePlan: { termId },
        month: 2,
        year: 2026
      }
    })
    console.log(`Deleted ${deleted.count} existing February plans\n`)
    
    // Calculate monthly hours (distribute total hours across 4 months)
    // February, March, April, May = 4 months
    let created = 0
    for (const tcp of termCoursePlans) {
      const totalHours = tcp.totalPlannedHours
      // Distribute evenly: Feb gets 25% of total
      const monthlyHours = Math.ceil(totalHours / 4)
      
      await prisma.monthlyCoursePlan.create({
        data: {
          termCoursePlanId: tcp.id,
          month: 2, // February
          year: 2026,
          plannedHours: monthlyHours
        }
      })
      created++
      console.log(`✅ ${tcp.course.name}: ${monthlyHours} hours for February`)
    }
    
    console.log(`\n✅ Created ${created} MonthlyCoursePlans for February 2026`)
    
    // Verify
    const verify = await prisma.monthlyCoursePlan.findMany({
      where: {
        termCoursePlan: { termId },
        month: 2,
        year: 2026
      }
    })
    console.log(`\n🔍 Verification: ${verify.length} plans exist for February 2026`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

createFebruaryPlans()
