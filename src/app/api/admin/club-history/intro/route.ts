import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auditUpdateData } from '@/lib/admin-audit-route';

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const contentHtml = typeof body.contentHtml === 'string' ? body.contentHtml : '';
  const coverUrl =
    typeof body.coverUrl === 'string' && body.coverUrl.trim() ? body.coverUrl.trim() : null;
  const audit = await auditUpdateData();

  const intro = await prisma.clubHistoryIntro.upsert({
    where: { id: 'main' },
    create: { id: 'main', contentHtml, coverUrl, ...audit },
    update: { contentHtml, coverUrl, ...audit },
  });

  return NextResponse.json(intro);
}
