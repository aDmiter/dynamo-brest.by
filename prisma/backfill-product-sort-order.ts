/**
 * Заполнить sortOrder по createdAt внутри групп isHit / не isHit.
 * npx tsx prisma/backfill-product-sort-order.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillGroup(isHit: boolean) {
  const products = await prisma.product.findMany({
    where: { isHit },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  for (let i = 0; i < products.length; i++) {
    await prisma.product.update({
      where: { id: products[i].id },
      data: { sortOrder: i },
    });
  }

  console.log(`${isHit ? 'Хиты' : 'Каталог'}: ${products.length} товаров`);
}

async function main() {
  await backfillGroup(true);
  await backfillGroup(false);
  console.log('Готово.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
