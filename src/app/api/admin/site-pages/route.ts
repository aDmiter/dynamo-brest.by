import { NextResponse } from 'next/server';
import { requireAdminSection } from '@/lib/admin-api-auth';
import { prisma } from '@/lib/prisma';
import { syncSitePageRegistry } from '@/lib/site-pages-registry';

export async function GET() {
  const auth = await requireAdminSection('settings');
  if (auth instanceof NextResponse) return auth;

  const pages = await prisma.sitePageMeta.findMany({
    orderBy: [{ source: 'asc' }, { path: 'asc' }],
  });

  return NextResponse.json(pages);
}

export async function POST() {
  const auth = await requireAdminSection('settings');
  if (auth instanceof NextResponse) return auth;

  const count = await syncSitePageRegistry();
  const pages = await prisma.sitePageMeta.findMany({
    orderBy: [{ source: 'asc' }, { path: 'asc' }],
  });

  return NextResponse.json({ count, pages });
}
