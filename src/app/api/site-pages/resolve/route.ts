import { NextRequest, NextResponse } from 'next/server';
import { getSitePageRedirect } from '@/lib/site-page-meta';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path') ?? '/';
  const redirectTo = await getSitePageRedirect(path);

  return NextResponse.json(
    { redirectTo },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    }
  );
}
