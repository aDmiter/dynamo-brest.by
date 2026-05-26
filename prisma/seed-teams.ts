// prisma/seed-teams.ts — три состава для COMET и сайта
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEAMS = [
  {
    name: 'Основной состав',
    slug: 'osnovnoy-sostav',
    cometId: '68812',
    order: 1,
  },
  {
    name: 'Дублирующий состав',
    slug: 'dubliruyushchiy-sostav',
    cometId: '102734',
    order: 2,
  },
  {
    name: 'Женская команда',
    slug: 'zhenskaya-komanda',
    cometId: '101132',
    order: 3,
  },
] as const;

async function main() {
  console.log('🌱 Заполнение составов (team)...');

  for (const t of TEAMS) {
    const team = await prisma.team.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        cometId: t.cometId,
        isActive: true,
        order: t.order,
      },
      create: {
        name: t.name,
        slug: t.slug,
        cometId: t.cometId,
        isActive: true,
        order: t.order,
      },
    });
    console.log(`  ✅ ${team.name} (${team.slug})`);
  }

  console.log('✅ Составы готовы');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
