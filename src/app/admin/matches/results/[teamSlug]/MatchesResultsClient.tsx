// src/app/admin/matches/results/[teamSlug]/MatchesResultsClient.tsx
'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faUsers } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import Image from 'next/image';

interface OpponentInfo {
  id: string;
  cometId: number | null;
  name: string;
  logoUrl: string | null;
}

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeScore: number | null;
  awayScore: number | null;
  matchDate: string;
  tournament: string | null;
  round: string | null;
  status: string;
  isHome: boolean;
  attendance: number | null;
  hasProtocol?: boolean;
}

interface Props {
  initialMatches: Match[];
  teamName: string;
  allTeams: OpponentInfo[];
}

export default function MatchesResultsClient({ initialMatches, allTeams }: Props) {
  const [matches] = useState<Match[]>(initialMatches);

  const getLogo = (teamId: number | null) => {
    if (!teamId) return null;
    return allTeams.find((t) => t.cometId === teamId)?.logoUrl || null;
  };

  const getResultColor = (match: Match) => {
    if (match.homeScore === null || match.awayScore === null) return 'text-gray-400';
    if (match.isHome) {
      if (match.homeScore > match.awayScore) return 'text-green-500';
      if (match.homeScore === match.awayScore) return 'text-yellow-500';
      return 'text-red-500';
    } else {
      if (match.awayScore > match.homeScore) return 'text-green-500';
      if (match.awayScore === match.homeScore) return 'text-yellow-500';
      return 'text-red-500';
    }
  };

  return (
    <div className="space-y-2">
      {matches.length === 0 ? (
        <div className="border border-white/10 bg-white/5 p-8 text-center text-gray-500">
          Нет сыгранных матчей
        </div>
      ) : (
        matches.map((match) => (
          <div
            key={match.id}
            className="border border-white/10 bg-white/5 backdrop-blur-sm p-3 flex items-center gap-4 hover:bg-white/[0.07] transition-colors"
          >
            <div className="text-xs text-gray-500 w-20 text-center">
              {new Date(match.matchDate).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                year: '2-digit',
              })}
            </div>

            <div className="flex-1 flex items-center gap-3 justify-center min-w-[300px]">
              <div className="flex items-center gap-2 flex-1 justify-end text-sm text-white">
                {match.homeTeam}
                {match.homeTeamId && getLogo(match.homeTeamId) && (
                  <Image
                    src={getLogo(match.homeTeamId)!}
                    alt=""
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                )}
              </div>

              <div
                className={`text-lg font-bold min-w-[60px] text-center ${getResultColor(match)}`}
              >
                {match.homeScore ?? '—'} : {match.awayScore ?? '—'}
              </div>

              <div className="flex items-center gap-2 flex-1 text-sm text-white">
                {match.awayTeamId && getLogo(match.awayTeamId) && (
                  <Image
                    src={getLogo(match.awayTeamId)!}
                    alt=""
                    width={20}
                    height={20}
                    className="object-contain"
                  />
                )}
                {match.awayTeam}
              </div>
            </div>

            <div className="text-right min-w-[120px]">
              {match.tournament && <p className="text-[10px] text-[#ee862c]">{match.tournament}</p>}
              {match.round && <p className="text-[10px] text-gray-500">{match.round} тур</p>}
              {match.attendance !== null && match.attendance !== undefined && (
                <p className="text-[10px] text-gray-400 mt-0.5 flex items-center justify-end gap-1">
                  <FontAwesomeIcon icon={faUsers} className="text-[9px]" />
                  {match.attendance.toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-1">
              {match.hasProtocol && (
                <span className="text-[10px] uppercase tracking-wide text-gray-500">Протокол</span>
              )}
              <Link
                href={`/admin/matches/${match.id}/edit`}
                className="text-sm text-[#ee862c] hover:underline"
                title="Редактировать матч и протокол"
              >
                <FontAwesomeIcon icon={faEdit} />
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
