import { NextRequest, NextResponse } from 'next/server';
import { SITE_LANG_COOKIE, isSiteLang } from '@/lib/site-locale';

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const lang = typeof body.lang === 'string' ? body.lang : '';

  if (!isSiteLang(lang)) {
    return NextResponse.json({ error: 'Некорректный язык' }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true, lang });
  res.cookies.set(SITE_LANG_COOKIE, lang, {
    path: '/',
    maxAge: ONE_YEAR,
    sameSite: 'lax',
  });
  return res;
}
