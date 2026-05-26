/**
 * Сид логотипов партнёров и блока «Стать партнером».
 * npx tsx prisma/seed-club-partners.ts
 */
import { PrismaClient } from '@prisma/client';
import {
  CLUB_GENERAL_PARTNERS,
  CLUB_PARTNERS,
  CLUB_TITLE_SPONSORS,
} from '../src/config/club-partners';
import { DEFAULT_CLUB_PARTNERS_CTA_HTML } from '../src/lib/club-partners';

const prisma = new PrismaClient();

async function main() {
  await prisma.clubPartnersPage.upsert({
    where: { id: 'main' },
    create: { id: 'main', ctaHtml: DEFAULT_CLUB_PARTNERS_CTA_HTML },
    update: {},
  });

  const count = await prisma.clubPartnerLogo.count();
  if (count > 0) {
    console.log(`clubPartnerLogo: уже ${count} записей, пропуск`);
    return;
  }

  const groups: { section: string; items: typeof CLUB_TITLE_SPONSORS }[] = [
    { section: 'title', items: CLUB_TITLE_SPONSORS },
    { section: 'general', items: CLUB_GENERAL_PARTNERS },
    { section: 'partners', items: CLUB_PARTNERS },
  ];

  for (const { section, items } of groups) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await prisma.clubPartnerLogo.create({
        data: {
          section,
          src: item.src,
          alt: item.alt,
          href: item.href ?? null,
          sortOrder: i,
        },
      });
    }
  }

  console.log('club partners: логотипы созданы');

  const { buildClubPartnersPageHtml } = await import('../src/lib/club-partners-html');
  const { loadClubPartnersData } = await import('../src/lib/club-partners-sync');
  const data = await loadClubPartnersData();
  const html = buildClubPartnersPageHtml(data);
  const updated = await prisma.menuitem.updateMany({
    where: { slug: 'club-partners', type: 'page' },
    data: { pageContent: html },
  });
  console.log(`club-partners CMS: обновлено пунктов меню: ${updated.count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
