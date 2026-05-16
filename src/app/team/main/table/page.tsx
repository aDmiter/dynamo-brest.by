// src/app/team/main/table/page.tsx
import { Metadata } from 'next';
import StandingsPageView from '@/modules/team/components/StandingsPageView';

export const metadata: Metadata = {
  title: 'Турнирная таблица | Динамо-Брест',
  description: 'Турнирная таблица.',
};

export default function StandingsPage() {
  return <StandingsPageView cometId="68812" />;
}
