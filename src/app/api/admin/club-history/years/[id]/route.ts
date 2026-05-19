import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ClubHistoryYearImageInput } from '@/lib/club-history-types';
import { auditUpdateData } from '@/lib/admin-audit-route';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function parseImages(raw: unknown): ClubHistoryYearImageInput[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item) => item && typeof item.url === 'string' && item.url.trim())
    .map((item, index) => ({
      url: item.url.trim(),
      alt: typeof item.alt === 'string' ? item.alt : '',
      sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : index,
    }));
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();
  const label = typeof body.label === 'string' ? body.label.trim() : '';
  if (!label) {
    return NextResponse.json({ error: 'Укажите название года' }, { status: 400 });
  }

  const year = typeof body.year === 'number' ? body.year : parseInt(label.match(/\d{4}/)?.[0] ?? '0', 10);
  const images = parseImages(body.images);

  await prisma.$transaction([
    prisma.clubHistoryYearImage.deleteMany({ where: { yearId: id } }),
    prisma.clubHistoryYear.update({
      where: { id },
      data: {
        label,
        year: year || new Date().getFullYear(),
        highlight: Boolean(body.highlight),
        contentHtml: typeof body.contentHtml === 'string' ? body.contentHtml : '',
        isActive: body.isActive !== false,
        ...(await auditUpdateData()),
        images: {
          create: images.map((img, index) => ({
            url: img.url,
            alt: img.alt ?? '',
            sortOrder: index,
          })),
        },
      },
    }),
  ]);

  const updated = await prisma.clubHistoryYear.findUnique({
    where: { id },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  await prisma.clubHistoryYear.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
