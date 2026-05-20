import { NextResponse } from 'next/server';
import { getSitePreviewStatus } from '@/lib/site-preview';

export async function GET() {
  const status = await getSitePreviewStatus();
  return NextResponse.json(status, {
    headers: {
      'Cache-Control': 'private, max-age=5',
    },
  });
}
