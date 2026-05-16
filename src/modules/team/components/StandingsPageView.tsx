'use client';

import { useState } from 'react';
import CompactPageHero from '@/modules/shared/ui/CompactPageHero';
import StandingsTable from '@/modules/team/components/StandingsTable';

interface Props {
  cometId: string;
}

export default function StandingsPageView({ cometId }: Props) {
  const [tournamentName, setTournamentName] = useState('');

  return (
    <div
      style={{
        fontFamily: "'Inter Tight', sans-serif",
        background: 'var(--color-bg-main)',
        minHeight: '100vh',
        color: '#ffffff',
        overflowX: 'hidden',
      }}
    >
      <CompactPageHero
        subtitle={tournamentName || 'Загрузка…'}
        title="Турнирная таблица"
        watermark="ТАБЛИЦА"
      />

      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 32px 80px' }}>
        <StandingsTable cometId={cometId} onTournamentName={setTournamentName} />
        <p
          className="mt-6 text-right text-xs"
          style={{ color: 'var(--color-text-label)' }}
        >
          * Данные предоставлены платформой АБФФ
        </p>
      </div>
    </div>
  );
}
