// prisma/generate-slugs.ts
import { PrismaClient } from '@prisma/client';
import { transliterate } from '../src/lib/utils';

const prisma = new PrismaClient();

async function generateSlugs() {
  const players = await prisma.player.findMany();
  console.log(`Всего игроков: ${players.length}`);

  for (const player of players) {
    let slug = transliterate(`${player.firstName}-${player.lastName}`);
    slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (!slug) slug = `player-${Date.now().toString().slice(-6)}`;

    // Проверяем уникальность
    const existing = await prisma.player.findFirst({
      where: { slug, id: { not: player.id } },
    });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-6)}`;
    }

    await prisma.player.update({ where: { id: player.id }, data: { slug } });
    console.log(`${player.lastName}: ${slug}`);
  }

  console.log('Готово');
  await prisma.$disconnect();
}

generateSlugs();
