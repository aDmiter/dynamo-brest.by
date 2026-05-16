// src/app/team/women/table/page.tsx
import { Metadata } from 'next';
import StandingsTable from '@/modules/team/components/StandingsTable';

export const metadata: Metadata = {
  title: 'Турнирная таблица (Женская) | Динамо-Брест',
  description: 'Турнирная таблица женской команды.',
};

export default function WomenStandingsPage() {
  return (
    <div
      className="min-h-screen pt-24 pb-16 px-4"
      style={{ background: 'var(--color-bg-main)', fontFamily: "'Inter Tight', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto">
        <h1
          className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider text-center mb-8"
          style={{ fontFamily: "'Inter Tight', sans-serif" }}
        >
          Турнирная таблица
        </h1>
        <StandingsTable cometId="101132" />
        <div className="mt-6 text-right text-xs" style={{ color: 'var(--color-text-label)' }}>
          * Данные предоставлены платформой АБФФ
        </div>
      </div>
    </div>
  );
}
