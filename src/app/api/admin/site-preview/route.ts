import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSection } from '@/lib/admin-api-auth';
import { prisma } from '@/lib/prisma';
import { clearSettingsCache } from '@/lib/settings';
import {
  DEFAULT_SITE_PREVIEW_MESSAGE,
  SITE_PREVIEW_SETTING_KEYS,
} from '@/lib/site-preview';

function serializeUser(user: {
  id: string;
  login: string;
  label: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    login: user.login,
    label: user.label,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function GET() {
  const authResult = await requireAdminSection('settings');
  if (authResult instanceof NextResponse) return authResult;

  const settings = await prisma.setting.findMany({
    where: { key: { in: Object.values(SITE_PREVIEW_SETTING_KEYS) } },
  });
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  const users = await prisma.sitePreviewUser.findMany({ orderBy: { createdAt: 'asc' } });

  const enabled = ['1', 'true', 'yes', 'on'].includes(
    (map[SITE_PREVIEW_SETTING_KEYS.enabled] ?? '').trim().toLowerCase()
  );

  return NextResponse.json({
    enabled,
    message: map[SITE_PREVIEW_SETTING_KEYS.message]?.trim() || DEFAULT_SITE_PREVIEW_MESSAGE,
    users: users.map(serializeUser),
  });
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireAdminSection('settings');
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const enabled = Boolean(body.enabled);
    const message = String(body.message ?? '').trim() || DEFAULT_SITE_PREVIEW_MESSAGE;

    await prisma.setting.upsert({
      where: { key: SITE_PREVIEW_SETTING_KEYS.enabled },
      create: { key: SITE_PREVIEW_SETTING_KEYS.enabled, value: enabled ? '1' : '0' },
      update: { value: enabled ? '1' : '0' },
    });
    await prisma.setting.upsert({
      where: { key: SITE_PREVIEW_SETTING_KEYS.message },
      create: { key: SITE_PREVIEW_SETTING_KEYS.message, value: message },
      update: { value: message },
    });

    clearSettingsCache();

    return NextResponse.json({ success: true, enabled, message });
  } catch {
    return NextResponse.json({ error: 'Ошибка сохранения' }, { status: 500 });
  }
}
