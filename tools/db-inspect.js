const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function monthKey(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`
}

async function main() {
  const needle = process.argv[2] || 'PTE-69'

  console.log(`\n🔎 Inspecting DB for term matching: ${needle}\n`)

  const terms = await prisma.term.findMany({
    where: {
      isDeleted: false,
      OR: [
        { termCode: { contains: needle, mode: 'insensitive' } },
        { name: { contains: needle, mode: 'insensitive' } },
      ],
    },
    include: {
      settings: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  if (terms.length === 0) {
    console.log('❌ No matching terms found.')
    return
  }

  console.log(`✅ Found ${terms.length} candidate term(s):`)
  for (const t of terms) {
    console.log(`- id=${t.id} | ${t.termCode} | ${t.name} | ${t.startDate.toISOString().slice(0, 10)} → ${t.endDate.toISOString().slice(0, 10)}`)
  }

  const term = terms[0]
  console.log(`\n🎯 Using most recent: ${term.termCode} (${term.id})\n`)

  const workingDays = Array.isArray(term.settings?.workingDays) ? term.settings.workingDays : null
  console.log('⚙️ Settings:')
  console.log(`- hasSettings: ${!!term.settings}`)
  console.log(`- workingDays: ${workingDays ? workingDays.join(', ') : '(null/invalid)'}`)

  const termCoursePlans = await prisma.termCoursePlan.findMany({
    where: { termId: term.id },
    select: {
      id: true,
      totalPlannedHours: true,
      course: { select: { id: true, code: true, name: true } },
    },
  })

  const tcpCount = termCoursePlans.length
  const tcpSum = termCoursePlans.reduce((acc, p) => acc + (p.totalPlannedHours || 0), 0)
  const tcpMin = tcpCount ? Math.min(...termCoursePlans.map((p) => p.totalPlannedHours || 0)) : 0
  const tcpMax = tcpCount ? Math.max(...termCoursePlans.map((p) => p.totalPlannedHours || 0)) : 0
  const tcpZero = termCoursePlans.filter((p) => (p.totalPlannedHours || 0) === 0).length

  console.log('\n📋 TermCoursePlan:')
  console.log(`- count: ${tcpCount}`)
  console.log(`- totalPlannedHours sum/min/max: ${tcpSum} / ${tcpMin} / ${tcpMax}`)
  console.log(`- zero totalPlannedHours: ${tcpZero}`)

  const monthlyPlans = await prisma.monthlyCoursePlan.findMany({
    where: { termCoursePlan: { termId: term.id } },
    select: {
      month: true,
      year: true,
      plannedHours: true,
      termCoursePlan: { select: { totalPlannedHours: true, courseId: true } },
    },
  })

  const mpCount = monthlyPlans.length
  const mpPositive = monthlyPlans.filter((p) => p.plannedHours > 0).length
  const mpSum = monthlyPlans.reduce((acc, p) => acc + p.plannedHours, 0)

  const months = new Set(monthlyPlans.map((p) => monthKey(p.year, p.month)))
  const monthsSorted = Array.from(months).sort()

  console.log('\n📅 MonthlyCoursePlan:')
  console.log(`- count: ${mpCount}`)
  console.log(`- plannedHours>0: ${mpPositive}`)
  console.log(`- plannedHours sum: ${mpSum}`)
  console.log(`- distinct months: ${monthsSorted.length ? monthsSorted.join(', ') : '(none)'}`)

  const classes = await prisma.class.findMany({
    where: { termId: term.id, isDeleted: false },
    select: { id: true, name: true, code: true, capacity: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })

  console.log('\n🏫 Classes:')
  console.log(`- count: ${classes.length}`)
  if (classes.length) {
    for (const c of classes) {
      console.log(`  - ${c.code} | ${c.name} | capacity=${c.capacity} | id=${c.id}`)
    }
  }

  // Extra: check if any course has monthly planned hours but term total is 0
  const mismatch = monthlyPlans.filter((p) => p.plannedHours > 0 && (p.termCoursePlan.totalPlannedHours || 0) === 0).length
  console.log(`\n🔎 Suspicious: monthly plannedHours>0 but term totalPlannedHours=0 rows: ${mismatch}`)

  // Start-month quick view
  const startMonth = term.startDate.getMonth() + 1
  const startYear = term.startDate.getFullYear()
  const startMonthPlans = monthlyPlans.filter((p) => p.month === startMonth && p.year === startYear)
  console.log(`\n🗓️ Start month (${startYear}-${String(startMonth).padStart(2, '0')}): rows=${startMonthPlans.length}, positive=${startMonthPlans.filter(p=>p.plannedHours>0).length}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
