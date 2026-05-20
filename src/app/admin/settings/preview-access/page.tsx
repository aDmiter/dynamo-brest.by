import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import {
  DEFAULT_SITE_PREVIEW_MESSAGE,
  SITE_PREVIEW_SETTING_KEYS,
} from '@/lib/site-preview';
import SitePreviewAccessAdmin from '@/modules/admin/components/SitePreviewAccessAdmin';

export const metadata: Metadata = {
  title: 'Закрытый доступ к сайту | Админ-панель',
};

export const dynamic = 'force-dynamic';

export default async function PreviewAccessSettingsPage() {
  const [settings, users] = await Promise.all([
    prisma.setting.findMany({
      where: { key: { in: Object.values(SITE_PREVIEW_SETTING_KEYS) } },
    }),
    prisma.sitePreviewUser.findMany({ orderBy: { createdAt: 'asc' } }),
  ]);

  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  const enabled = ['1', 'true', 'yes', 'on'].includes(
    (map[SITE_PREVIEW_SETTING_KEYS.enabled] ?? '').trim().toLowerCase()
  );

  return (
    <div>
      <h1 className="mb-2 font-heading text-2xl font-bold text-white">Закрытый доступ к сайту</h1>
      <p className="mb-8 text-sm text-gray-400">
        Временная заглушка для проверки банком: закройте публичную версию и выдайте отдельные логины.
      </p>
      <SitePreviewAccessAdmin
        initialEnabled={enabled}
        initialMessage={map[SITE_PREVIEW_SETTING_KEYS.message]?.trim() || DEFAULT_SITE_PREVIEW_MESSAGE}
        initialUsers={users.map((u) => ({
          id: u.id,
          login: u.login,
          label: u.label,
          isActive: u.isActive,
        }))}
      />
    </div>
  );
}
