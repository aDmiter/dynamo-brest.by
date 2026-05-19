import type { Metadata } from 'next';
import { getClubHistoryPublic } from '@/lib/club-history';
import ClubHistoryView from '@/modules/club/components/ClubHistoryView';

export const metadata: Metadata = {
  title: 'История | Динамо-Брест',
  description:
    'История ФК «Динамо-Брест»: основание клуба, кубки, чемпионство и сезоны с 1960 года по настоящее время.',
};

export default async function ClubHistoryPage() {
  const data = await getClubHistoryPublic();
  return <ClubHistoryView data={data} />;
}
