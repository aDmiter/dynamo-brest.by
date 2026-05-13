// src/app/admin/matches/calendar/[teamSlug]/MatchesCalendarClient.tsx
'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faMapMarkerAlt,
  faQuestionCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import StadiumModal from '@/modules/shared/ui/StadiumModal';

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
  matchDate: string;
  stadium: string | null;
  facilityId: number | null;
  tournament: string | null;
  round: string | null;
  isHome: boolean;
}

interface Props {
  initialMatches: Match[];
  teamSlug: string;
  teamName: string;
  allTeams: OpponentInfo[];
}

function cleanTeamName(name: string): string {
  return name
    .replace(/\d+\s*:\s*\d+/, '')
    .replace(/\d+\s*-\s*\d+/, '')
    .replace(/-:-/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[""]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function MatchesCalendarClient({ initialMatches, teamSlug, allTeams }: Props) {
  const [stadiumModal, setStadiumModal] = useState<number | null>(null);

  const isTBD = (dateStr: string) => new Date(dateStr).getFullYear() < 2000;

  const sortedMatches = [...initialMatches].sort((a, b) => {
    const aTBD = isTBD(a.matchDate);
    const bTBD = isTBD(b.matchDate);
    if (aTBD && !bTBD) return 1;
    if (!aTBD && bTBD) return -1;
    if (aTBD && bTBD) {
      const aR = parseInt(a.round || '0') || 0;
      const bR = parseInt(b.round || '0') || 0;
      return aR - bR;
    }
    return new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime();
  });

  const getLogo = (teamId: number | null) => {
    if (!teamId) return null;
    return allTeams.find((t) => t.cometId === teamId)?.logoUrl || null;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (d.getFullYear() < 2000) return null;
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (d.getFullYear() < 2000) return null;
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="mb-4">
        <Link href={`/admin/matches/new?teamSlug=${teamSlug}`}>
          <Button size="sm" className="bg-[#ee862c] hover:bg-[#f0ac74]">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Добавить матч
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {sortedMatches.length === 0 ? (
          <div className="border border-white/10 bg-white/5 p-8 text-center text-gray-500">
            Нет запланированных матчей
          </div>
        ) : (
          sortedMatches.map((match) => {
            const tbd = isTBD(match.matchDate);
            return (
              <div
                key={match.id}
                className={`border border-white/10 bg-white/5 backdrop-blur-sm p-4 flex items-center gap-6 flex-wrap hover:bg-white/[0.07] transition-colors ${tbd ? 'opacity-60' : ''}`}
              >
                <div className="text-center min-w-[80px]">
                  {tbd ? (
                    <>
                      <FontAwesomeIcon
                        icon={faQuestionCircle}
                        className="text-gray-500 text-xl mb-1"
                      />
                      <p className="text-xs text-gray-500">Дата уточняется</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-gray-400">{formatDate(match.matchDate)}</p>
                      <p className="text-lg font-bold text-white">{formatTime(match.matchDate)}</p>
                    </>
                  )}
                  {match.round && (
                    <p
                      className={`text-[10px] mt-1 ${tbd ? 'text-[#ee862c] font-bold' : 'text-gray-500'}`}
                    >
                      {match.round} тур
                    </p>
                  )}
                </div>

                <div className="flex-1 flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2 text-right flex-1 justify-end">
                    <span className="text-white font-medium text-sm">
                      {cleanTeamName(match.homeTeam)}
                    </span>
                    {match.homeTeamId && getLogo(match.homeTeamId) && (
                      <Image
                        src={getLogo(match.homeTeamId)!}
                        alt=""
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    )}
                  </div>
                  <div className={`text-2xl font-bold ${tbd ? 'text-gray-700' : 'text-gray-600'}`}>
                    VS
                  </div>
                  <div className="flex items-center gap-2 text-left flex-1">
                    {match.awayTeamId && getLogo(match.awayTeamId) && (
                      <Image
                        src={getLogo(match.awayTeamId)!}
                        alt=""
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    )}
                    <span className="text-white font-medium text-sm">
                      {cleanTeamName(match.awayTeam)}
                    </span>
                  </div>
                </div>

                <div className="text-right min-w-[150px]">
                  {match.tournament && <p className="text-xs text-[#ee862c]">{match.tournament}</p>}
                  {match.stadium && (
                    <button
                      onClick={() =>
                        match.facilityId ? setStadiumModal(match.facilityId) : undefined
                      }
                      className={`text-xs mt-1 flex items-center gap-1 ml-auto ${match.facilityId ? 'text-gray-300 hover:text-white cursor-pointer transition-colors' : 'text-gray-500'}`}
                    >
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" />
                      {match.stadium}
                    </button>
                  )}
                  {match.isHome && <p className="text-[10px] text-green-500 mt-1">Дома</p>}
                  {!match.isHome && <p className="text-[10px] text-blue-400 mt-1">Выезд</p>}
                </div>

                <div>
                  <Link
                    href={`/admin/matches/${match.id}/edit`}
                    className="text-sm text-[#ee862c] hover:underline"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      <StadiumModal
        facilityId={stadiumModal}
        isOpen={stadiumModal !== null}
        onClose={() => setStadiumModal(null)}
      />
    </div>
  );
}
