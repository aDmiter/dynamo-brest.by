// prisma/seed-menu.ts - Заполнение меню начальными данными
import { PrismaClient } from '@prisma/client';
import { CODED_MENU_ROUTES } from '../src/config/coded-menu-routes';
import { CODED_CMS_PAGES } from '../src/config/coded-cms-pages';
import { CLUB_CONTACT_SECTIONS } from '../src/config/club-contacts';
import { clubContactSectionsToHtml } from '../src/lib/club-contacts-html';
import { CMS_PAGE_HTML_BY_SLUG } from '../src/lib/cms-page-html/pages';

const prisma = new PrismaClient();

/** Страница из src/app — только type: link + linkUrl (не CMSTextPage) */
const link = 'link' as const;
const page = 'page' as const;

function cmsPage(slug: keyof typeof CMS_PAGE_HTML_BY_SLUG) {
  const cfg = CODED_CMS_PAGES[slug];
  return {
    type: page,
    linkUrl: null,
    subtitle: cfg.defaultSubtitle,
    pageContent: CMS_PAGE_HTML_BY_SLUG[slug](),
    heroHeader: cfg.defaultHeroHeader ?? false,
    imageUrl: cfg.defaultImageUrl ?? null,
  };
}

async function seedMenu() {
  console.log('🌱 Заполнение меню...');

  // Удаляем существующие пункты
  await prisma.menuitem.deleteMany();

  // Создаём корневые пункты
  const main = await prisma.menuitem.create({
    data: { title: 'Основной состав', slug: 'osnova', type: 'link', order: 1 },
  });

  await prisma.menuitem.createMany({
    data: [
      {
        title: 'Игроки',
        slug: 'osnova-players',
        type: link,
        linkUrl: '/team/main/players',
        parentId: main.id,
        order: 1,
      },
      {
        title: 'Тренеры',
        slug: 'osnova-coaches',
        linkUrl: '/team/main/coaches',
        parentId: main.id,
        order: 2,
      },
      {
        title: 'Календарь',
        slug: 'osnova-calendar',
        linkUrl: '/team/main/calendar',
        parentId: main.id,
        order: 3,
      },
      {
        title: 'Результаты',
        slug: 'osnova-results',
        linkUrl: '/team/main/results',
        parentId: main.id,
        order: 4,
      },
      {
        title: 'Таблица',
        slug: 'osnova-table',
        linkUrl: '/team/main/table',
        parentId: main.id,
        order: 5,
      },
    ],
  });

  const dubl = await prisma.menuitem.create({
    data: { title: 'Дублирующий состав', slug: 'dubl', type: 'link', order: 2 },
  });

  await prisma.menuitem.createMany({
    data: [
      {
        title: 'Игроки',
        slug: 'dubl-players',
        linkUrl: '/team/reserve/players',
        parentId: dubl.id,
        order: 1,
      },
      {
        title: 'Тренеры',
        slug: 'dubl-coaches',
        linkUrl: '/team/reserve/coaches',
        parentId: dubl.id,
        order: 2,
      },
      {
        title: 'Календарь',
        slug: 'dubl-calendar',
        linkUrl: '/team/reserve/calendar',
        parentId: dubl.id,
        order: 3,
      },
      {
        title: 'Результаты',
        slug: 'dubl-results',
        linkUrl: '/team/reserve/results',
        parentId: dubl.id,
        order: 4,
      },
      {
        title: 'Таблица',
        slug: 'dubl-table',
        linkUrl: '/team/reserve/table',
        parentId: dubl.id,
        order: 5,
      },
    ],
  });

  const women = await prisma.menuitem.create({
    data: { title: 'Женская команда', slug: 'women', type: 'link', order: 3 },
  });

  await prisma.menuitem.createMany({
    data: [
      {
        title: 'Игроки',
        slug: 'women-players',
        linkUrl: '/team/women/players',
        parentId: women.id,
        order: 1,
      },
      {
        title: 'Тренеры',
        slug: 'women-coaches',
        linkUrl: '/team/women/coaches',
        parentId: women.id,
        order: 2,
      },
      {
        title: 'Календарь',
        slug: 'women-calendar',
        linkUrl: '/team/women/calendar',
        parentId: women.id,
        order: 3,
      },
      {
        title: 'Результаты',
        slug: 'women-results',
        linkUrl: '/team/women/results',
        parentId: women.id,
        order: 4,
      },
      {
        title: 'Таблица',
        slug: 'women-table',
        linkUrl: '/team/women/table',
        parentId: women.id,
        order: 5,
      },
    ],
  });

  const school = await prisma.menuitem.create({
    data: { title: 'Школа', slug: 'school', type: 'link', order: 4 },
  });

  await prisma.menuitem.createMany({
    data: [
      {
        title: 'О школе',
        slug: 'school-about',
        ...cmsPage('school-about'),
        parentId: school.id,
        order: 1,
      },
      {
        title: 'Как стать игроком',
        slug: 'school-join',
        ...cmsPage('school-join'),
        parentId: school.id,
        order: 2,
      },
      {
        title: 'Тренеры',
        slug: 'school-coaches',
        linkUrl: '/school/coaches',
        parentId: school.id,
        order: 3,
      },
      {
        title: 'Турниры',
        slug: 'school-tournaments',
        ...cmsPage('school-tournaments'),
        parentId: school.id,
        order: 4,
      },
      {
        title: 'Команды',
        slug: 'school-teams',
        ...cmsPage('school-teams'),
        parentId: school.id,
        order: 5,
      },
    ],
  });

  const club = await prisma.menuitem.create({
    data: { title: 'Клуб', slug: 'club', type: 'link', order: 5 },
  });

  await prisma.menuitem.createMany({
    data: [
      {
        title: 'Администрация',
        slug: 'club-admin',
        linkUrl: '/club/administration',
        parentId: club.id,
        order: 1,
      },
      {
        title: 'История',
        slug: 'club-history',
        linkUrl: '/club/history',
        parentId: club.id,
        order: 2,
      },
      {
        title: 'Партнеры и спонсоры',
        slug: 'club-partners',
        ...cmsPage('club-partners'),
        parentId: club.id,
        order: 3,
      },
      {
        title: 'Стадион',
        slug: 'club-stadium',
        ...cmsPage('club-stadium'),
        parentId: club.id,
        order: 4,
      },
      {
        title: 'Контакты',
        slug: 'club-contacts',
        type: 'page',
        subtitle: 'Клуб',
        pageContent: clubContactSectionsToHtml(CLUB_CONTACT_SECTIONS),
        parentId: club.id,
        order: 5,
      },
    ],
  });

  const fans = await prisma.menuitem.create({
    data: { title: 'Фан-зона', slug: 'fans', type: 'link', order: 6 },
  });

  await prisma.menuitem.create({
    data: {
      title: 'Болельщики',
      slug: 'fans-supporters',
      ...cmsPage('fans-supporters'),
      parentId: fans.id,
      order: 1,
    },
  });

  const services = await prisma.menuitem.create({
    data: { title: 'Услуги', slug: 'services', type: 'link', order: 7 },
  });

  await prisma.menuitem.createMany({
    data: [
      {
        title: 'Услуги транспорта',
        slug: 'services-transport',
        ...cmsPage('services-transport'),
        parentId: services.id,
        order: 1,
      },
      {
        title: 'Услуги полей',
        slug: 'services-fields',
        ...cmsPage('services-fields'),
        parentId: services.id,
        order: 2,
      },
      {
        title: 'Кафе',
        slug: 'services-cafe',
        ...cmsPage('services-cafe'),
        parentId: services.id,
        order: 3,
      },
      {
        title: 'Гостиница',
        slug: 'services-hotel',
        ...cmsPage('services-hotel'),
        parentId: services.id,
        order: 4,
      },
      {
        title: 'Тренажерный зал',
        slug: 'services-gym',
        ...cmsPage('services-gym'),
        parentId: services.id,
        order: 5,
      },
      {
        title: 'Билеты',
        slug: 'tickets',
        type: link,
        linkUrl: CODED_MENU_ROUTES.tickets,
        parentId: services.id,
        order: 6,
      },
    ],
  });

  const shop = await prisma.menuitem.create({
    data: { title: 'Интернет-магазин', slug: 'shop', type: 'link', order: 8 },
  });

  await prisma.menuitem.createMany({
    data: [
      {
        title: 'Каталог',
        slug: 'shop-catalog',
        type: link,
        linkUrl: CODED_MENU_ROUTES['shop-catalog'],
        parentId: shop.id,
        order: 1,
      },
      {
        title: 'Доставка',
        slug: 'shop-delivery',
        ...cmsPage('shop-delivery'),
        parentId: shop.id,
        order: 2,
      },
      {
        title: 'Оплата',
        slug: 'shop-payment',
        ...cmsPage('shop-payment'),
        parentId: shop.id,
        order: 3,
      },
      {
        title: 'Возврат товара',
        slug: 'shop-returns',
        ...cmsPage('shop-returns'),
        parentId: shop.id,
        order: 4,
      },
    ],
  });

  const media = await prisma.menuitem.create({
    data: { title: 'Медиа', slug: 'media', type: 'link', order: 9 },
  });

  await prisma.menuitem.createMany({
    data: [
      {
        title: 'Для СМИ',
        slug: 'media-press',
        ...cmsPage('media-press'),
        parentId: media.id,
        order: 1,
      },
      {
        title: 'Гимны',
        slug: 'media-anthems',
        ...cmsPage('media-anthems'),
        parentId: media.id,
        order: 2,
      },
    ],
  });

  console.log('✅ Меню заполнено');
}

seedMenu()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
