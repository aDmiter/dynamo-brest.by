// prisma/seed.ts - Создание первого администратора
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@dynamo-brest.by' },
    update: {},
    create: {
      email: 'admin@dynamo-brest.by',
      password: hashedPassword,
      name: 'Администратор',
      role: 'admin',
    },
  });

  console.log('Администратор создан:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
