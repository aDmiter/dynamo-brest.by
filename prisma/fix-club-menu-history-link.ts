/**
 * Заменить «О клубе» на «История» (/club/history) в меню «Клуб».
 * Запуск: npx tsx prisma/fix-club-menu-history-link.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const club = await prisma.menuitem.findFirst({
    where: { slug: 'club', parentId: null },
  });
  if (!club) {
    console.log('Раздел «Клуб» не найден.');
    return;
  }

  const about = await prisma.menuitem.findUnique({ where: { slug: 'club-about' } });
  const history = await prisma.menuitem.findUnique({ where: { slug: 'club-history' } });

  if (about) {
    await prisma.menuitem.update({
      where: { slug: 'club-about' },
      data: {
        title: 'История',
        linkUrl: '/club/history',
        type: 'link',
        pageContent: null,
      },
    });
    console.log('✓ «О клубе» → «История», URL /club/history');
  }

  if (history && history.id !== about?.id) {
    await prisma.menuitem.delete({ where: { slug: 'club-history' } });
    console.log('✓ Удалён дублирующий пункт club-history');
  }

  if (!about && history) {
    await prisma.menuitem.update({
      where: { slug: 'club-history' },
      data: { title: 'История', linkUrl: '/club/history', type: 'link', pageContent: null },
    });
    console.log('✓ club-history обновлён');
  }

  if (!about && !history) {
    const order =
      (
        await prisma.menuitem.aggregate({
          where: { parentId: club.id },
          _max: { order: true },
        })
      )._max.order ?? 0;

    await prisma.menuitem.create({
      data: {
        title: 'История',
        slug: 'club-history',
        linkUrl: '/club/history',
        type: 'link',
        parentId: club.id,
        order: order + 1,
        isActive: true,
      },
    });
    console.log('✓ Создан пункт «История»');
  }

  console.log('\nГотово.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
