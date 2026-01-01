const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function monthKey(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`
}

async function main() {
  const term = await prisma.term.findFirst({
    where: { termCode: 'PTE-69', isDeleted: false },
    select: { id: true, termCode: true, startDate: true, endDate: true, duration: true },
  })

  if (!term) {
    console.log('PTE-69 bulunamadı')
    return
  }

  console.log('TERM', {
    id: term.id,
    termCode: term.termCode,
    duration: term.duration,
    start: term.startDate.toISOString().split('T')[0],
    end: term.endDate.toISOString().split('T')[0],
  })

  const start = new Date(term.startDate)
  const end = new Date(term.endDate)
  const months = []
  let cur = new Date(start)
  while (cur <= end) {
    const y = cur.getFullYear()
    const m = cur.getMonth() + 1
    const k = monthKey(y, m)
    if (!months.includes(k)) months.push(k)
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1)
  }

  console.log('TERM MONTHS', months.join(', '))

  // örnek 8 dersin dağılımını göster
  const plans = await prisma.termCoursePlan.findMany({
    where: { termId: term.id },
    include: {
      course: { select: { code: true, name: true } },
      monthlyPlans: { orderBy: [{ year: 'asc' }, { month: 'asc' }] },
    },
    orderBy: { course: { name: 'asc' } },
    take: 8,
  })

  for (const p of plans) {
    const dist = new Map(months.map((k) => [k, 0]))
    for (const mp of p.monthlyPlans) {
      const k = monthKey(mp.year, mp.month)
      if (dist.has(k)) dist.set(k, mp.plannedHours)
    }
    const arr = months.map((k) => dist.get(k))
    const sum = arr.reduce((a, b) => a + (b || 0), 0)

    console.log('\n', `${p.course.code} - ${p.course.name}`)
    console.log(' totalPlannedHours:', p.totalPlannedHours, ' monthlySum:', sum)
    console.log(' months:', months.join(' | '))
    console.log(' planned:', arr.join(' | '))
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
