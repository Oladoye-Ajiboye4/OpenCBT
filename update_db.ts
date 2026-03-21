import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const updated = await prisma.user.update({
    where: { staffId: '202695040' },
    data: { name: 'Dr. John Doe' } // Added a dummy name for testing
  })
  console.log("Updated Lecturer:", updated)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
