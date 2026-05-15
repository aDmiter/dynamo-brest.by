// src/app/team/reserve/table/page.tsx
import { Metadata } from 'next';
import StandingsTable from '@/modules/team/components/StandingsTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faTrophy } from '@fortawesome/free-solid-svg-icons';

export const metadata: Metadata = {
  title: 'Турнирная таблица (Дубль) | Динамо-Брест',
  description: 'Турнирная таблица второй лиги 2026.',
};

export default function ReserveStandingsPage() {
  return (
    <div
      className="min-h-screen pt-24 pb-16 px-4"
      style={{ background: 'var(--color-bg-main)', fontFamily: "'Inter Tight', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-block relative mb-4">
            <FontAwesomeIcon
              icon={faTrophy}
              className="text-5xl absolute -left-8 top-1/2 transform -translate-y-1/2"
              style={{ color: 'var(--color-accent)', opacity: 0.2 }}
            />
            <h1
              className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider"
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              Турнирная таблица
            </h1>
          </div>
          <p
            className="text-sm mt-2 flex items-center justify-center gap-2"
            style={{ color: 'var(--color-text-stat)' }}
          >
            <FontAwesomeIcon icon={faCalendarAlt} style={{ color: 'var(--color-accent)' }} />
            Вторая лига 2026
          </p>
        </div>

        <StandingsTable teamSlug="dubliruyushchiy-sostav" title="Вторая лига 2026" />

        <div className="mt-6 text-right text-xs" style={{ color: 'var(--color-text-label)' }}>
          * Данные предоставлены платформой АБФФ
        </div>
      </div>
    </div>
  );
}
