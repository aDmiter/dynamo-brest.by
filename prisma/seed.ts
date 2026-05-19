// prisma/seed.ts — суперадмин только через SUPERADMIN_PASSWORD (см. prisma/reset-superadmin.ts)
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const login = process.env.SUPERADMIN_LOGIN ?? 'd.stasyuk';
  const password = process.env.SUPERADMIN_PASSWORD;
  if (!password) {
    console.log('Пропуск admin: задайте SUPERADMIN_PASSWORD или запустите prisma/reset-superadmin.ts');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.upsert({
    where: { email: login },
    update: { role: 'superadmin', isActive: true, password: hashedPassword },
    create: {
      email: login,
      password: hashedPassword,
      name: process.env.SUPERADMIN_NAME ?? 'Суперадминистратор',
      role: 'superadmin',
      isActive: true,
    },
  });

  console.log('Суперадмин:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
