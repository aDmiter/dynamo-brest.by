import { NextResponse } from 'next/server';
import { SITE_PREVIEW_COOKIE } from '@/lib/site-preview';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SITE_PREVIEW_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
