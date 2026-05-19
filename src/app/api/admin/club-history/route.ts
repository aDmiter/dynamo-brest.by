import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const [intro, years] = await Promise.all([
    prisma.clubHistoryIntro.findUnique({ where: { id: 'main' } }),
    prisma.clubHistoryYear.findMany({
      include: { images: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    }),
  ]);

  return NextResponse.json({
    intro: intro ?? { id: 'main', contentHtml: '', coverUrl: null },
    years,
  });
}
