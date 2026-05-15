// src/app/admin/settings/page.tsx
import { prisma } from '@/lib/prisma';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: [
          'accent_color',
          'accent_hover',
          'accent_7',
          'accent_10',
          'accent_12',
          'accent_15',
          'accent_20',
          'accent_30',
          'bg_main',
          'bg_card',
          'bg_photo_placeholder',
          'bg_admin',
          'border',
          'border_light',
          'text_stat',
          'text_label',
          'team_names',
          'bio_text',
          'bio_watermark',
          'win',
          'loss',
          'yellow_card',
          'red_card',
        ],
      },
    },
  });

  const values: Record<string, string> = {};
  for (const s of settings) {
    values[s.key] = s.value;
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white mb-8">Настройки сайта</h1>
      <SettingsForm initialValues={values} />
    </div>
  );
}
