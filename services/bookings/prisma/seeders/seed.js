import { PrismaClient, Prisma } from '@prisma/client'

import bookingData from "./bookings.json" assert { type: "json" };
const prisma = new PrismaClient()



async function main() {
  console.log(`Start seeding ...`)
  for (const b of bookingData) {
    const booking = await prisma.booking.create({
      data: b,
    })
    console.log(`Created booking with id: ${booking.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
