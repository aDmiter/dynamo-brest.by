import { NextRequest, NextResponse } from 'next/server';
import { resolveSitePageRouting } from '@/lib/site-page-meta';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path') ?? '/';
  const routing = await resolveSitePageRouting(path);

  return NextResponse.json(routing, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
    },
  });
}
