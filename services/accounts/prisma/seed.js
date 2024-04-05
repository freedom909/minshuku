
import userData from "./users.json" assert { type: "json" };
import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)
  

  const existingNicknames = new Set();
  for (const u of userData) {
    if (u.nickname) {
      if (existingNicknames.has(u.nickname)) {
        console.error(`Duplicate nickname found: ${u.nickname}. Skipping user creation.`);
        continue;
      }

      existingNicknames.add(u.nickname);
    }

    const user = await prisma.user.create({
      data: u,
    });
    console.log(`Created user with id: ${user.id}`);
  }

  console.log(`Seeding finished.`);
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
