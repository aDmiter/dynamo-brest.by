// src/app/admin/settings/analytics/page.tsx
import { prisma } from '@/lib/prisma';
import { ANALYTICS_SETTING_KEYS } from '@/lib/analytics';
import AnalyticsSettingsForm from './AnalyticsSettingsForm';

export const dynamic = 'force-dynamic';

export default async function AnalyticsSettingsPage() {
  const settings = await prisma.setting.findMany({
    where: {
      key: { in: [ANALYTICS_SETTING_KEYS.google, ANALYTICS_SETTING_KEYS.yandex] },
    },
  });

  const values: Record<string, string> = {};
  for (const s of settings) {
    values[s.key] = s.value;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 font-heading text-2xl font-bold text-white">Аналитика</h1>
      <p className="mb-8 text-sm text-gray-400">
        Google Analytics и Яндекс.Метрика на публичном сайте
      </p>
      <AnalyticsSettingsForm
        initialGoogle={values[ANALYTICS_SETTING_KEYS.google] ?? ''}
        initialYandex={values[ANALYTICS_SETTING_KEYS.yandex] ?? ''}
      />
    </div>
  );
}
