import type { TeamStandingsBundle } from '@/lib/standings';

export interface MatchData {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeScore: number | null;
  awayScore: number | null;
  matchDate: string;
  stadium: string | null;
  facilityId: number | null;
  tournament: string | null;
  round: string | null;
  status: string;
  isHome: boolean;
  matchType: string | null;
  attendance: number | null;
  ticketUrl: string | null;
}

export interface TeamMatches {
  next: MatchData | null;
  last: MatchData | null;
  nextOppLogo: string | null;
  lastOppLogo: string | null;
}

export type { TeamStandingsBundle };

export interface MatchTabsClientProps {
  matches: {
    osnova: TeamMatches;
    dubl: TeamMatches;
    women: TeamMatches;
  };
  standings?: Record<MatchTabKey, TeamStandingsBundle | null>;
}

export const MATCH_TABS = [
  { key: 'osnova' as const, label: 'Основной состав', short: 'Основа' },
  { key: 'dubl' as const, label: 'Дубль', short: 'Дубль' },
  { key: 'women' as const, label: 'Женская', short: 'Женская' },
];

export type MatchTabKey = (typeof MATCH_TABS)[number]['key'];
