// src/app/team/main/table/page.tsx
import { Metadata } from 'next';
import StandingsTable from '@/modules/team/components/StandingsTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faTrophy } from '@fortawesome/free-solid-svg-icons';

export const metadata: Metadata = {
  title: 'Турнирная таблица | Динамо-Брест',
  description:
    'Турнирная таблица BETERA - Высшая лига 2026. Положение команд, статистика матчей, очки, забитые и пропущенные голы.',
};

export default function StandingsPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок страницы */}
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
            BETERA - Высшая лига 2026
          </p>
        </div>

        {/* Таблица */}
        <StandingsTable />

        {/* Подпись */}
        <div className="mt-6 text-right text-xs text-gray-500">
          * Данные предоставлены платформой АБФФ
        </div>
      </div>
    </div>
  );
}
