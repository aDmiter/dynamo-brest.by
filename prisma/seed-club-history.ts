/**
 * Импорт истории из club-history-data.ts в БД.
 * Запуск: npx tsx prisma/seed-club-history.ts
 */
import { PrismaClient } from '@prisma/client';
import {
  CLUB_HISTORY_INTRO_BLOCKS,
  CLUB_HISTORY_YEARS,
} from '../src/config/club-history-data';
import {
  blocksToContentHtml,
  blocksToImages,
  yearSortKeyFromLabel,
} from '../src/lib/club-history-migrate';

const prisma = new PrismaClient();

async function main() {
  const introImages = blocksToImages(
    CLUB_HISTORY_INTRO_BLOCKS.filter((b) => b.type === 'image'),
  );
  const introTextBlocks = CLUB_HISTORY_INTRO_BLOCKS.filter((b) => b.type !== 'image');
  const introCover = introImages[0]?.url ?? null;

  await prisma.clubHistoryIntro.upsert({
    where: { id: 'main' },
    create: {
      id: 'main',
      contentHtml: blocksToContentHtml(introTextBlocks),
      coverUrl: introCover,
    },
    update: {
      contentHtml: blocksToContentHtml(introTextBlocks),
      coverUrl: introCover,
    },
  });

  const existing = await prisma.clubHistoryYear.count();
  if (existing > 0) {
    console.log(`В БД уже ${existing} годов — пропуск импорта годов (удалите вручную для повторного импорта).`);
    return;
  }

  const sorted = [...CLUB_HISTORY_YEARS].sort((a, b) => b.year - a.year);

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i];
    const contentHtml = blocksToContentHtml(entry.blocks);
    const images = blocksToImages(entry.blocks);

    await prisma.clubHistoryYear.create({
      data: {
        label: entry.label,
        year: entry.year || yearSortKeyFromLabel(entry.label),
        sortOrder: i,
        highlight: entry.highlight ?? false,
        contentHtml,
        isActive: true,
        images: {
          create: images,
        },
      },
    });
  }

  console.log(`Импортировано ${sorted.length} годов истории.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
