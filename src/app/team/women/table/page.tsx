// src/app/team/women/table/page.tsx
import { Metadata } from 'next';
import StandingsTable from '@/modules/team/components/StandingsTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faTrophy } from '@fortawesome/free-solid-svg-icons';

export const metadata: Metadata = {
  title: 'Турнирная таблица (Женская) | Динамо-Брест',
  description: 'Турнирная таблица женской лиги 2026.',
};

export default function WomenStandingsPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <div className="inline-block relative mb-4">
            <FontAwesomeIcon
              icon={faTrophy}
              className="text-5xl text-[#ee862c] opacity-20 absolute -left-8 top-1/2 transform -translate-y-1/2"
            />
            <h1 className="font-heading text-4xl md:text-5xl font-black text-white uppercase tracking-wider">
              Турнирная таблица
            </h1>
          </div>
          <p className="text-gray-400 text-sm mt-2 flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-[#ee862c]" />
            Женская лига 2026
          </p>
        </div>

        <StandingsTable teamSlug="zhenskaya-komanda" title="Женская лига 2026" />

        <div className="mt-6 text-right text-xs text-gray-500">
          * Данные предоставлены платформой АБФФ
        </div>
      </div>
    </div>
  );
}
