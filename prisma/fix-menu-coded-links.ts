/**
 * Однократно: перевести coded-страницы в type=link с правильным URL.
 * Запуск: npx tsx prisma/fix-menu-coded-links.ts
 */
import { PrismaClient } from '@prisma/client';
import { CODED_MENU_ROUTES } from '../src/config/coded-menu-routes';

const prisma = new PrismaClient();

async function main() {
  let updated = 0;

  for (const [slug, linkUrl] of Object.entries(CODED_MENU_ROUTES)) {
    const result = await prisma.menuitem.updateMany({
      where: { slug },
      data: {
        type: 'link',
        linkUrl,
        pageContent: null,
      },
    });
    if (result.count > 0) {
      console.log(`✓ ${slug} → ${linkUrl}`);
      updated += result.count;
    }
  }

  const misconfigured = await prisma.menuitem.findMany({
    where: {
      type: 'page',
      linkUrl: { not: null },
    },
    select: { slug: true, linkUrl: true, title: true },
  });

  for (const item of misconfigured) {
    if (!item.linkUrl) continue;
    const isAppRoute =
      item.linkUrl.startsWith('/team/') ||
      item.linkUrl.startsWith('/services/') ||
      item.linkUrl.startsWith('/page/') ||
      item.linkUrl.startsWith('/shop/') ||
      item.linkUrl.startsWith('/club/') ||
      item.linkUrl.startsWith('/school/') ||
      item.linkUrl.startsWith('/news');

    if (isAppRoute) {
      await prisma.menuitem.update({
        where: { slug: item.slug },
        data: { type: 'link', pageContent: null },
      });
      console.log(`✓ ${item.slug} («${item.title}»): page → link, ${item.linkUrl}`);
      updated += 1;
    }
  }

  console.log(`\nГотово. Обновлено записей: ${updated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
