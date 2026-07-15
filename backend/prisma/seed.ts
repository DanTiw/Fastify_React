import { auth } from '../src/lib/auth';
import { prisma } from '../src/lib/prisma';

type SeedUser = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'USER';
};

const SEED_USERS: SeedUser[] = [
  {
    email: 'admin@example.com',
    password: 'Password123!',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
  },
  {
    email: 'user1@example.com',
    password: 'Password123!',
    firstName: 'Demo',
    lastName: 'User 1',
    role: 'USER',
  },
  {
    email: 'user2@example.com',
    password: 'Password123!',
    firstName: 'Demo',
    lastName: 'User 2',
    role: 'USER',
  },
  {
    email: 'user3@example.com',
    password: 'Password123!',
    firstName: 'Demo',
    lastName: 'User 3',
    role: 'USER',
  },
];

async function seedUser(user: SeedUser) {
  const existing = await prisma.user.findUnique({ where: { email: user.email } });
  if (existing) {
    await prisma.user.update({
      where: { email: user.email },
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: true,
        name: `${user.firstName} ${user.lastName}`.trim(),
      },
    });
    console.log(`  updated (already existed): ${user.email} [${user.role}]`);
    return;
  }

  await auth.api.signUpEmail({
    body: {
      email: user.email,
      password: user.password,
      name: `${user.firstName} ${user.lastName}`.trim(),
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: true,
    },
  });

  console.log(`  created: ${user.email} [${user.role}]`);
}

async function main() {
  console.log('Seeding users via Better Auth…');

  for (const user of SEED_USERS) {
    await seedUser(user);
  }

  console.log('');
  console.log('Seed complete. Log in with:');
  console.log('  admin@example.com / Password123!  (ADMIN)');
  console.log('  user1@example.com / Password123!  (USER)');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
