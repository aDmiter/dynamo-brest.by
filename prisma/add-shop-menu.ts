/**
 * Добавить раздел «Интернет-магазин» в главное меню (после «Услуги»).
 * Запуск: npx tsx prisma/add-shop-menu.ts
 */
import { PrismaClient } from '@prisma/client';
import { CODED_MENU_ROUTES } from '../src/config/coded-menu-routes';

const prisma = new PrismaClient();

const CHILDREN: { title: string; slug: keyof typeof CODED_MENU_ROUTES; order: number }[] = [
  { title: 'Каталог', slug: 'shop-catalog', order: 1 },
  { title: 'Доставка', slug: 'shop-delivery', order: 2 },
  { title: 'Оплата', slug: 'shop-payment', order: 3 },
  { title: 'Возврат товара', slug: 'shop-returns', order: 4 },
];

async function main() {
  const services = await prisma.menuitem.findUnique({ where: { slug: 'services' } });
  const shopOrder = services ? services.order + 1 : 8;

  const rootsToShift = await prisma.menuitem.findMany({
    where: { parentId: null, order: { gte: shopOrder }, slug: { not: 'shop' } },
    orderBy: { order: 'desc' },
    select: { id: true, order: true },
  });

  for (const item of rootsToShift) {
    await prisma.menuitem.update({
      where: { id: item.id },
      data: { order: item.order + 1 },
    });
  }

  let shop = await prisma.menuitem.findUnique({ where: { slug: 'shop' } });

  if (!shop) {
    shop = await prisma.menuitem.create({
      data: {
        title: 'Интернет-магазин',
        slug: 'shop',
        type: 'link',
        order: shopOrder,
      },
    });
    console.log(`✓ Создан раздел «Интернет-магазин» (order: ${shopOrder})`);
  } else {
    await prisma.menuitem.update({
      where: { id: shop.id },
      data: { title: 'Интернет-магазин', order: shopOrder },
    });
    console.log(`✓ Раздел «Интернет-магазин» обновлён (order: ${shopOrder})`);
  }

  for (const child of CHILDREN) {
    const linkUrl = CODED_MENU_ROUTES[child.slug];
    const existing = await prisma.menuitem.findUnique({ where: { slug: child.slug } });

    if (existing) {
      await prisma.menuitem.update({
        where: { slug: child.slug },
        data: {
          title: child.title,
          type: 'link',
          linkUrl,
          parentId: shop.id,
          order: child.order,
          pageContent: null,
        },
      });
      console.log(`✓ ${child.title} → ${linkUrl}`);
    } else {
      await prisma.menuitem.create({
        data: {
          title: child.title,
          slug: child.slug,
          type: 'link',
          linkUrl,
          parentId: shop.id,
          order: child.order,
        },
      });
      console.log(`+ ${child.title} → ${linkUrl}`);
    }
  }

  console.log('\nГотово.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
