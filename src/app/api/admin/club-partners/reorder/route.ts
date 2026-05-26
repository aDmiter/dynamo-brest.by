import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSection } from '@/lib/admin-api-auth';
import { syncClubPartnersToCms, isClubPartnerSection } from '@/lib/club-partners-sync';

export async function PUT(request: NextRequest) {
  const auth = await requireAdminSection('club_partners');
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const section = typeof body.section === 'string' ? body.section : '';
  const items = Array.isArray(body.items) ? body.items : [];

  if (!isClubPartnerSection(section)) {
    return NextResponse.json({ error: 'Некорректная секция' }, { status: 400 });
  }

  const updates = items
    .filter((item: { id?: string }) => typeof item?.id === 'string')
    .map((item: { id: string; sortOrder?: number }, index: number) =>
      prisma.clubPartnerLogo.update({
        where: { id: item.id },
        data: {
          sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : index,
        },
      }),
    );

  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }

  await syncClubPartnersToCms();
  return NextResponse.json({ success: true });
}
