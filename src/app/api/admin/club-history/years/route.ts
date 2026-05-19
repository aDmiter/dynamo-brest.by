import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ClubHistoryYearImageInput } from '@/lib/club-history-types';
import { auditCreateData } from '@/lib/admin-audit-route';

function parseImages(raw: unknown): ClubHistoryYearImageInput[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && typeof item.url === 'string' && item.url.trim())
    .map((item, index) => ({
      id: typeof item.id === 'string' ? item.id : undefined,
      url: item.url.trim(),
      alt: typeof item.alt === 'string' ? item.alt : '',
      sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : index,
    }));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const label = typeof body.label === 'string' ? body.label.trim() : '';
  if (!label) {
    return NextResponse.json({ error: 'Укажите название года' }, { status: 400 });
  }

  const year = typeof body.year === 'number' ? body.year : parseInt(label.match(/\d{4}/)?.[0] ?? '0', 10);
  const images = parseImages(body.images);
  const maxOrder = await prisma.clubHistoryYear.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  const created = await prisma.clubHistoryYear.create({
    data: {
      label,
      year: year || new Date().getFullYear(),
      sortOrder,
      highlight: Boolean(body.highlight),
      contentHtml: typeof body.contentHtml === 'string' ? body.contentHtml : '',
      isActive: body.isActive !== false,
      ...(await auditCreateData()),
      images: {
        create: images.map((img, index) => ({
          url: img.url,
          alt: img.alt ?? '',
          sortOrder: index,
        })),
      },
    },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  });

  return NextResponse.json(created, { status: 201 });
}
