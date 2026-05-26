import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminSection } from '@/lib/admin-api-auth';
import { DEFAULT_CLUB_PARTNERS_CTA_HTML } from '@/lib/club-partners';
import { syncClubPartnersToCms } from '@/lib/club-partners-sync';

export async function PUT(request: NextRequest) {
  const auth = await requireAdminSection('club_partners');
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const ctaHtml =
    typeof body.ctaHtml === 'string' ? body.ctaHtml : DEFAULT_CLUB_PARTNERS_CTA_HTML;

  await prisma.clubPartnersPage.upsert({
    where: { id: 'main' },
    create: { id: 'main', ctaHtml },
    update: { ctaHtml },
  });

  await syncClubPartnersToCms();
  return NextResponse.json({ success: true });
}
