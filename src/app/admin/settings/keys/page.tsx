// src/app/admin/settings/keys/page.tsx
import { prisma } from '@/lib/prisma';
import SettingsKeysForm from './SettingsKeysForm';

export const dynamic = 'force-dynamic';

const SETTING_KEYS = [
  { key: 'COMET_API_KEY_PLAYERS', label: 'COMET — Игроки' },
  { key: 'COMET_API_KEY_COACHES', label: 'COMET — Тренеры' },
  { key: 'COMET_API_KEY_STAFF', label: 'COMET — Персонал' },
  { key: 'COMET_API_KEY_MATCHES', label: 'COMET — Матчи' },
  { key: 'COMET_API_KEY_FACILITIES', label: 'COMET — Стадионы' },
  { key: 'COMET_STANDINGS_API_KEY_OSNOVA', label: 'COMET — Таблица (Основа)' },
  { key: 'COMET_STANDINGS_API_KEY_DUBL', label: 'COMET — Таблица (Дубль)' },
  { key: 'COMET_STANDINGS_API_KEY_WOMEN', label: 'COMET — Таблица (Женская)' },
  { key: 'COMET_API_KEY_MATCH_EVENTS', label: 'COMET — События матчей' },
  { key: 'COMET_API_KEY_PLAYER_STATS', label: 'COMET — Статистика игроков' },
];

export default async function SettingsKeysPage() {
  const settings = await prisma.setting.findMany({
    where: { key: { in: SETTING_KEYS.map((k) => k.key) } },
  });

  const values: Record<string, string> = {};
  for (const s of settings) {
    values[s.key] = s.value;
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white mb-8">Ключи API</h1>
      <SettingsKeysForm initialValues={values} keys={SETTING_KEYS} />
    </div>
  );
}
