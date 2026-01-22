const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.instructor.count({
    where: { isDeleted: false },
  })
  console.log('INSTRUCTOR_COUNT', count)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
