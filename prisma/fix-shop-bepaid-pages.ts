/**
 * Обновить HTML страниц магазина (bePaid) в menuitem.
 * Запуск: npx tsx prisma/fix-shop-bepaid-pages.ts
 */
import { PrismaClient } from '@prisma/client';
import { CMS_PAGE_HTML_BY_SLUG } from '../src/lib/cms-page-html/pages';

const prisma = new PrismaClient();

const SHOP_SLUGS = ['shop-delivery', 'shop-payment', 'shop-returns'] as const;

async function main() {
  for (const slug of SHOP_SLUGS) {
    const build = CMS_PAGE_HTML_BY_SLUG[slug];
    if (!build) continue;

    const result = await prisma.menuitem.updateMany({
      where: { slug },
      data: { pageContent: build() },
    });

    if (result.count > 0) {
      console.log(`✓ ${slug}`);
    } else {
      console.warn(`— ${slug}: пункт меню не найден`);
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
