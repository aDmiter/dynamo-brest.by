/**
 * Одноразовая настройка единственного суперадмина.
 * Запуск: npx tsx prisma/reset-superadmin.ts
 * Переменные (опционально): SUPERADMIN_LOGIN, SUPERADMIN_PASSWORD, SUPERADMIN_NAME
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const LOGIN = process.env.SUPERADMIN_LOGIN ?? 'd.stasyuk';
const PASSWORD = process.env.SUPERADMIN_PASSWORD ?? '';
const NAME = process.env.SUPERADMIN_NAME ?? 'Суперадминистратор';

async function main() {
  if (!PASSWORD) {
    console.error('Укажите SUPERADMIN_PASSWORD в окружении');
    process.exit(1);
  }

  const deleted = await prisma.admin.deleteMany({});
  console.log(`Удалено учётных записей: ${deleted.count}`);

  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  const admin = await prisma.admin.create({
    data: {
      email: LOGIN,
      password: hashedPassword,
      name: NAME,
      role: 'superadmin',
      isActive: true,
      permissions: undefined,
    },
  });

  console.log('Суперадмин создан:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
