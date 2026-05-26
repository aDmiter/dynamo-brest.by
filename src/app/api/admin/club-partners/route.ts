import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSection } from '@/lib/admin-api-auth';
import { loadClubPartnersData, syncClubPartnersToCms, isClubPartnerSection } from '@/lib/club-partners-sync';

export async function GET() {
  const auth = await requireAdminSection('club_partners');
  if (auth instanceof NextResponse) return auth;

  const data = await loadClubPartnersData();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminSection('club_partners');
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const section = typeof body.section === 'string' ? body.section : '';
  const src = typeof body.src === 'string' ? body.src.trim() : '';
  const alt = typeof body.alt === 'string' ? body.alt.trim() : '';

  if (!isClubPartnerSection(section)) {
    return NextResponse.json({ error: 'Некорректная секция' }, { status: 400 });
  }
  if (!src) {
    return NextResponse.json({ error: 'Загрузите логотип' }, { status: 400 });
  }

  const max = await prisma.clubPartnerLogo.aggregate({
    where: { section },
    _max: { sortOrder: true },
  });

  const logo = await prisma.clubPartnerLogo.create({
    data: {
      section,
      src,
      alt: alt || 'Партнёр',
      href: typeof body.href === 'string' && body.href.trim() ? body.href.trim() : null,
      sortOrder: (max._max.sortOrder ?? -1) + 1,
    },
  });

  await syncClubPartnersToCms();
  return NextResponse.json(logo);
}
