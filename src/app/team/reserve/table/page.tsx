// src/app/team/reserve/table/page.tsx
import { Metadata } from 'next';
import StandingsPageView from '@/modules/team/components/StandingsPageView';

export const metadata: Metadata = {
  title: 'Турнирная таблица (Дубль) | Динамо-Брест',
  description: 'Турнирная таблица дублирующего состава.',
};

export default function ReserveStandingsPage() {
  return <StandingsPageView cometId="102734" />;
}
