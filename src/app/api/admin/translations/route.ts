import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdminSection } from '@/lib/admin-api-auth';
import {
  UI_TRANSLATION_DEFAULTS,
  UI_TRANSLATION_GROUPS,
  UI_TRANSLATION_KEYS,
  type UiTranslationKey,
} from '@/config/ui-translations';

function isUiKey(key: string): key is UiTranslationKey {
  return UI_TRANSLATION_KEYS.includes(key as UiTranslationKey);
}

export async function GET() {
  const auth = await requireAdminSection('translations');
  if (auth instanceof NextResponse) return auth;

  const rows = await prisma.translation.findMany({
    where: { locale: 'be', key: { startsWith: 'ui.' } },
  });
  const beByKey = new Map(rows.map((r) => [r.key, r.value]));

  const items = UI_TRANSLATION_KEYS.map((key) => ({
    key,
    ru: UI_TRANSLATION_DEFAULTS[key],
    be: beByKey.get(key) ?? '',
  }));

  return NextResponse.json({ groups: UI_TRANSLATION_GROUPS, items });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminSection('translations');
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const items = Array.isArray(body.items) ? body.items : [];

  for (const raw of items) {
    if (!raw || typeof raw !== 'object') continue;
    const key = typeof raw.key === 'string' ? raw.key : '';
    if (!isUiKey(key)) continue;

    const be = typeof raw.be === 'string' ? raw.be.trim() : '';

    if (!be) {
      await prisma.translation.deleteMany({ where: { key, locale: 'be' } });
      continue;
    }

    await prisma.translation.upsert({
      where: {
        key_locale: { key, locale: 'be' },
      },
      create: { key, locale: 'be', value: be },
      update: { value: be },
    });
  }

  revalidateTag('ui-translations-be', 'max');

  return NextResponse.json({ success: true });
}
