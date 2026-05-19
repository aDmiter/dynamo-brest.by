import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auditUpdateData } from '@/lib/admin-audit-route';

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const audit = await auditUpdateData();
  const items = Array.isArray(body.items) ? body.items : [];

  const updates = items
    .filter((item: { id?: string }) => typeof item?.id === 'string')
    .map((item: { id: string; sortOrder?: number }, index: number) =>
      prisma.clubHistoryYear.update({
        where: { id: item.id },
        data: {
          sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : index,
          ...audit,
        },
      }),
    );

  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }

  return NextResponse.json({ success: true });
}
