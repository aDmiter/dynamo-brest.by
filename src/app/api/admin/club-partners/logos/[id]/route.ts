import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSection } from '@/lib/admin-api-auth';
import { syncClubPartnersToCms } from '@/lib/club-partners-sync';

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminSection('club_partners');
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const body = await request.json();
  const data: Record<string, unknown> = {};

  if (typeof body.alt === 'string') data.alt = body.alt.trim() || 'Партнёр';
  if (typeof body.href === 'string') data.href = body.href.trim() || null;
  if (body.href === null) data.href = null;
  if (typeof body.src === 'string' && body.src.trim()) data.src = body.src.trim();
  if (typeof body.isActive === 'boolean') data.isActive = body.isActive;

  try {
    const logo = await prisma.clubPartnerLogo.update({ where: { id }, data });
    await syncClubPartnersToCms();
    return NextResponse.json(logo);
  } catch {
    return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const auth = await requireAdminSection('club_partners');
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;

  try {
    await prisma.clubPartnerLogo.delete({ where: { id } });
    await syncClubPartnersToCms();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Запись не найдена' }, { status: 404 });
  }
}
