import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await argon2.hash('Password123!', { type: argon2.argon2id });

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', passwordHash, firstName: 'Admin', lastName: 'User', role: 'ADMIN' },
  });

  for (let i = 1; i <= 3; i++) {
    await prisma.user.upsert({
      where: { email: `user${i}@example.com` },
      update: {},
      create: { email: `user${i}@example.com`, passwordHash, firstName: 'Demo', lastName: `User ${i}`, role: 'USER' },
    });
  }

  console.log('Seed complete. Log in with  admin@example.com / Password123!');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
