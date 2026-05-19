/**
 * Перевод coded-страниц в CMSTextPage (menuitem type=page) с HTML-контентом.
 * Обновляет только содержимое; подпункты остаются внутри своих разделов меню.
 * Запуск: npx tsx prisma/fix-coded-cms-pages.ts
 */
import { PrismaClient } from '@prisma/client';
import { CODED_CMS_PAGES } from '../src/config/coded-cms-pages';
import { CMS_PAGE_HTML_BY_SLUG } from '../src/lib/cms-page-html/pages';
import { clubContactSectionsToHtml } from '../src/lib/club-contacts-html';
import { CLUB_CONTACT_SECTIONS } from '../src/config/club-contacts';

const prisma = new PrismaClient();

const DEFAULT_TITLES: Record<string, string> = {
  'services-transport': 'Услуги транспорта',
  'services-fields': 'Услуги полей',
  'services-cafe': 'Кафе',
  'services-hotel': 'Гостиница',
  'services-gym': 'Тренажерный зал',
  'school-about': 'О школе',
  'school-join': 'Как стать игроком',
  'school-tournaments': 'Турниры',
  'school-teams': 'Команды',
  'fans-supporters': 'Болельщики',
  'shop-delivery': 'Доставка',
  'shop-payment': 'Оплата',
  'shop-returns': 'Возврат товара',
  'club-contacts': 'Контакты',
  'club-partners': 'Партнеры и спонсоры',
  'club-stadium': 'Стадион',
  'media-press': 'Для СМИ',
  'media-anthems': 'Гимны',
};

/** Родительский раздел меню (slug корневого пункта) */
const CMS_PAGE_PARENT_SLUG: Record<string, string> = {
  'services-transport': 'services',
  'services-fields': 'services',
  'services-cafe': 'services',
  'services-hotel': 'services',
  'services-gym': 'services',
  'school-about': 'school',
  'school-join': 'school',
  'school-tournaments': 'school',
  'school-teams': 'school',
  'fans-supporters': 'fans',
  'shop-delivery': 'shop',
  'shop-payment': 'shop',
  'shop-returns': 'shop',
  'club-contacts': 'club',
  'club-partners': 'club',
  'club-stadium': 'club',
  'media-press': 'media',
  'media-anthems': 'media',
};

/** Порядок среди соседних подпунктов */
const CMS_PAGE_ORDER: Record<string, number> = {
  'services-transport': 1,
  'services-fields': 2,
  'services-cafe': 3,
  'services-hotel': 4,
  'services-gym': 5,
  'school-about': 1,
  'school-join': 2,
  'school-tournaments': 4,
  'school-teams': 5,
  'fans-supporters': 1,
  'shop-delivery': 2,
  'shop-payment': 3,
  'shop-returns': 4,
  'club-contacts': 5,
  'club-partners': 3,
  'club-stadium': 4,
  'media-press': 1,
  'media-anthems': 2,
};

async function resolveParentId(slug: string): Promise<string | null> {
  const parentSlug = CMS_PAGE_PARENT_SLUG[slug];
  if (!parentSlug) return null;
  const parent = await prisma.menuitem.findFirst({ where: { slug: parentSlug } });
  return parent?.id ?? null;
}

async function upsertCmsPage(slug: string, pageContent: string) {
  const config = CODED_CMS_PAGES[slug];
  if (!config) {
    console.warn(`Пропуск ${slug}: нет в CODED_CMS_PAGES`);
    return;
  }

  const parentId = await resolveParentId(slug);
  const existing = await prisma.menuitem.findUnique({ where: { slug } });
  const data = {
    type: 'page' as const,
    linkUrl: null,
    title: existing?.title || DEFAULT_TITLES[slug] || slug,
    subtitle: existing?.subtitle ?? config.defaultSubtitle,
    pageContent,
    heroHeader: existing?.heroHeader ?? config.defaultHeroHeader ?? false,
    imageUrl: existing?.imageUrl ?? config.defaultImageUrl ?? null,
    isActive: true,
    ...(parentId ? { parentId, order: CMS_PAGE_ORDER[slug] ?? existing?.order ?? 0 } : {}),
  };

  if (existing) {
    await prisma.menuitem.update({ where: { id: existing.id }, data });
    console.log(`✓ ${slug} → ${config.path}${parentId ? ' (подпункт)' : ''}`);
  } else if (parentId) {
    await prisma.menuitem.create({
      data: { slug, ...data },
    });
    console.log(`+ ${slug} (создан как подпункт)`);
  } else {
    console.warn(`⚠ ${slug}: пункт не найден, родитель отсутствует — пропуск создания`);
  }
}

async function ensureMenuSection(slug: string, title: string, order: number) {
  const existing = await prisma.menuitem.findFirst({ where: { slug } });
  if (existing) return existing;
  const created = await prisma.menuitem.create({
    data: { title, slug, type: 'link', order, isActive: true },
  });
  console.log(`+ раздел «${title}» (${slug})`);
  return created;
}

async function main() {
  await ensureMenuSection('media', 'Медиа', 9);

  for (const [slug, buildHtml] of Object.entries(CMS_PAGE_HTML_BY_SLUG)) {
    await upsertCmsPage(slug, buildHtml());
  }

  await upsertCmsPage('club-contacts', clubContactSectionsToHtml(CLUB_CONTACT_SECTIONS));

  await prisma.menuitem.updateMany({
    where: { type: 'page', linkUrl: { not: null } },
    data: { linkUrl: null },
  });

  console.log('Готово.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
