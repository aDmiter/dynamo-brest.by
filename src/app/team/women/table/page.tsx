// src/app/team/women/table/page.tsx
import { Metadata } from 'next';
import StandingsPageView from '@/modules/team/components/StandingsPageView';

export const metadata: Metadata = {
  title: 'Турнирная таблица (Женская) | Динамо-Брест',
  description: 'Турнирная таблица женской команды.',
};

export default function WomenStandingsPage() {
  return <StandingsPageView cometId="101132" />;
}
