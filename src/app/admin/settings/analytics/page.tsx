// src/app/admin/settings/analytics/page.tsx
import { prisma } from '@/lib/prisma';
import {
  ANALYTICS_SETTING_KEYS,
  parseGoogleAnalyticsId,
  parseSettingFlag,
  parseYandexMetrikaId,
} from '@/lib/analytics';
import AnalyticsSettingsForm from './AnalyticsSettingsForm';

export const dynamic = 'force-dynamic';

export default async function AnalyticsSettingsPage() {
  const settings = await prisma.setting.findMany({
    where: {
      key: { in: Object.values(ANALYTICS_SETTING_KEYS) },
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
        initialGoogle={parseGoogleAnalyticsId(values[ANALYTICS_SETTING_KEYS.google] ?? '')}
        initialYandex={parseYandexMetrikaId(values[ANALYTICS_SETTING_KEYS.yandex] ?? '')}
        initialGoogleEnabled={parseSettingFlag(values[ANALYTICS_SETTING_KEYS.googleEnabled])}
        initialYandexEnabled={parseSettingFlag(values[ANALYTICS_SETTING_KEYS.yandexEnabled])}
      />
    </div>
  );
}
