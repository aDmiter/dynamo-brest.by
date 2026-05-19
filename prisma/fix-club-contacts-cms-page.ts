/**
 * Перевод пункта «Контакты» в CMSTextPage (menuitem type=page).
 * Запуск: npx tsx prisma/fix-club-contacts-cms-page.ts
 */
import { PrismaClient } from '@prisma/client';
import { CLUB_CONTACT_SECTIONS } from '../src/config/club-contacts';
import {
  CLUB_CONTACTS_CMS_LEAD,
  clubContactSectionsToHtml,
} from '../src/lib/club-contacts-html';

const prisma = new PrismaClient();

async function main() {
  const html = clubContactSectionsToHtml(CLUB_CONTACT_SECTIONS);
  const existing = await prisma.menuitem.findFirst({
    where: { OR: [{ slug: 'club-contacts' }, { linkUrl: '/club/contacts' }] },
  });

  if (existing) {
    await prisma.menuitem.update({
      where: { id: existing.id },
      data: {
        slug: 'club-contacts',
        type: 'page',
        linkUrl: null,
        title: existing.title || 'Контакты',
        subtitle: existing.subtitle ?? 'Клуб',
        pageContent: html,
        heroHeader: existing.heroHeader ?? false,
        isActive: true,
      },
    });
    console.log('Обновлён menuitem club-contacts (type=page, CMSTextPage).');
    return;
  }

  const club = await prisma.menuitem.findFirst({ where: { slug: 'club' } });
  await prisma.menuitem.create({
    data: {
      title: 'Контакты',
      slug: 'club-contacts',
      type: 'page',
      subtitle: 'Клуб',
      pageContent: html,
      parentId: club?.id ?? null,
      order: 5,
      isActive: true,
    },
  });
  console.log('Создан menuitem club-contacts.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
