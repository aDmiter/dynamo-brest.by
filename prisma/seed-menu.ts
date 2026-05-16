// prisma/seed-menu.ts - Заполнение меню начальными данными
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
        linkUrl: '/school/about',
        parentId: school.id,
        order: 1,
      },
      {
        title: 'Как стать игроком',
        slug: 'school-join',
        linkUrl: '/school/join',
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
        linkUrl: '/school/tournaments',
        parentId: school.id,
        order: 4,
      },
      {
        title: 'Команды',
        slug: 'school-teams',
        linkUrl: '/school/teams',
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
      { title: 'О клубе', slug: 'club-about', linkUrl: '/club/about', parentId: club.id, order: 2 },
      {
        title: 'Партнеры и спонсоры',
        slug: 'club-partners',
        linkUrl: '/club/partners',
        parentId: club.id,
        order: 3,
      },
      {
        title: 'Стадион',
        slug: 'club-stadium',
        linkUrl: '/club/stadium',
        parentId: club.id,
        order: 4,
      },
      {
        title: 'Контакты',
        slug: 'club-contacts',
        linkUrl: '/club/contacts',
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
      linkUrl: '/fans',
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
        type: 'page',
        linkUrl: '/page/services-transport',
        subtitle: 'Услуги',
        imageUrl: '/images/services/buses/mercedes/mercedes_1.jpg',
        parentId: services.id,
        order: 1,
      },
      {
        title: 'Услуги полей',
        slug: 'services-fields',
        linkUrl: '/services/fields',
        parentId: services.id,
        order: 2,
      },
      {
        title: 'Кафе',
        slug: 'services-cafe',
        linkUrl: '/services/cafe',
        parentId: services.id,
        order: 3,
      },
      {
        title: 'Гостиница',
        slug: 'services-hotel',
        linkUrl: '/services/hotel',
        parentId: services.id,
        order: 4,
      },
      {
        title: 'Тренажерный зал',
        slug: 'services-gym',
        type: 'link',
        linkUrl: '/services/gym',
        imageUrl: '/images/services/gym/216A7477-JPG.jpg',
        subtitle: 'Услуги',
        parentId: services.id,
        order: 5,
      },
    ],
  });

  console.log('✅ Меню заполнено');
}

seedMenu()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
