const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const term = await prisma.term.findFirst({
    where: { termCode: 'PTE-69', isDeleted: false },
    select: {
      id: true,
      name: true,
      termCode: true,
      duration: true,
      startDate: true,
      endDate: true,
      status: true,
    },
  })

  if (!term) {
    console.log('PTE-69 bulunamadı')
    return
  }

  console.log({
    id: term.id,
    termCode: term.termCode,
    name: term.name,
    duration: term.duration,
    status: term.status,
    startDate: term.startDate.toISOString().split('T')[0],
    endDate: term.endDate.toISOString().split('T')[0],
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
