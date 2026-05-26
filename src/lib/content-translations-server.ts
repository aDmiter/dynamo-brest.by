import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { SITE_LANG_COOKIE, parseSiteLang, type SiteLang } from '@/lib/site-locale';
import { getSiteLangFromHeaders } from '@/lib/ui-translations-server';

export { getSiteLangFromHeaders };

export async function getSiteLangFromCookies(): Promise<SiteLang> {
  const store = await cookies();
  return parseSiteLang(store.get(SITE_LANG_COOKIE)?.value);
}

export function getSiteLangFromRequest(request: NextRequest): SiteLang {
  return parseSiteLang(request.cookies.get(SITE_LANG_COOKIE)?.value);
}
