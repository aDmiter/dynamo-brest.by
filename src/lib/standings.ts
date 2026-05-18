// src/lib/standings.ts — турнирная таблица COMET для блока матчей и страниц таблицы
import { prisma } from '@/lib/prisma';
import { getSetting } from '@/lib/settings';

const COMET_BASE_URL = process.env.COMET_API_BASE_URL || 'https://comet.abff.by';

export const COMET_STANDINGS_IDS = {
  osnova: '68812',
  dubl: '102734',
  women: '101132',
} as const;

export type MatchTeamSlug = keyof typeof COMET_STANDINGS_IDS;

const STANDINGS_CONFIG: Record<string, { settingKey: string; envKey: string }> = {
  '68812': {
    settingKey: 'COMET_STANDINGS_API_KEY_OSNOVA',
    envKey: 'COMET_STANDINGS_API_KEY_OSNOVA',
  },
  '102734': {
    settingKey: 'COMET_STANDINGS_API_KEY_DUBL',
    envKey: 'COMET_STANDINGS_API_KEY_DUBL',
  },
  '101132': {
    settingKey: 'COMET_STANDINGS_API_KEY_WOMEN',
    envKey: 'COMET_STANDINGS_API_KEY_WOMEN',
  },
};

/** clubId «Динамо-Брест» в отчёте COMET по составу */
const DYNAMO_CLUB_ID: Record<string, number> = {
  '68812': 68812,
  '102734': 102734,
  '101132': 101132,
};

export interface StandingsRow {
  position: number;
  club: string;
  clubId: number;
  logoUrl: string | null;
  matches: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface CometStandingsResult {
  success: true;
  standings: StandingsRow[];
  tournament: string;
}

export type TeamStandingsSnapshot = {
  position: number;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalDifference: number;
  tournament: string | null;
  totalTeams: number;
};

/** Место в таблице по clubId COMET */
export type StandingsPositionMap = Record<number, number>;

export type TeamStandingsBundle = {
  dynamo: TeamStandingsSnapshot | null;
  positionsByClubId: StandingsPositionMap;
};

export function buildPositionsMap(standings: StandingsRow[]): StandingsPositionMap {
  const map: StandingsPositionMap = {};
  for (const row of standings) {
    if (row.clubId != null) map[row.clubId] = row.position;
  }
  return map;
}

export function getStandingPosition(
  bundle: TeamStandingsBundle | null | undefined,
  clubId: number | null | undefined,
): number | null {
  if (!bundle || clubId == null) return null;
  const position = bundle.positionsByClubId[clubId];
  return position ?? null;
}

export async function fetchCometStandings(
  cometId: string,
): Promise<CometStandingsResult | null> {
  const config = STANDINGS_CONFIG[cometId];
  if (!config) return null;

  const dbKey = await getSetting(config.settingKey);
  const envKey = process.env[config.envKey] || '';
  const apiKey = dbKey || envKey;
  if (!apiKey) return null;

  try {
    const url = `${COMET_BASE_URL}/data-backend/api/public/areports/run/0/50/?API_KEY=${apiKey}`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;

    const data = await response.json();

    const tournament = (data.results?.[0]?.name as string) || '';

    const standings: StandingsRow[] =
      data.results?.map((team: Record<string, unknown>) => ({
        position: team.position as number,
        club: team.club as string,
        clubId: team.clubId as number,
        logoUrl: null,
        matches: team.matches as number,
        wins: team.wins as number,
        draws: team.draws as number,
        losses: team.losses as number,
        goalsFor: team.goalsFor as number,
        goalsAgainst: team.goalsAgainst as number,
        goalDifference: team.goalDifference as number,
        points: team.points as number,
      })) || [];

    standings.sort((a, b) => a.position - b.position);

    const clubIds = standings.map((s) => s.clubId).filter((id) => id != null);
    const opponentTeams = await prisma.opponentTeam.findMany({
      where: { cometId: { in: clubIds } },
      select: { cometId: true, name: true, logoUrl: true },
    });

    const teamMap: Record<number, { name: string; logoUrl: string | null }> = {};
    for (const opp of opponentTeams) {
      if (opp.cometId) teamMap[opp.cometId] = { name: opp.name, logoUrl: opp.logoUrl };
    }

    const standingsWithLogos = standings.map((team) => {
      const mapped = teamMap[team.clubId];
      return {
        ...team,
        club: mapped?.name || team.club,
        logoUrl: mapped?.logoUrl || null,
      };
    });

    return { success: true, standings: standingsWithLogos, tournament };
  } catch {
    return null;
  }
}

export function findDynamoStanding(
  standings: StandingsRow[],
  cometId: string,
): StandingsRow | undefined {
  const clubId = DYNAMO_CLUB_ID[cometId];
  if (!clubId) return undefined;
  return standings.find((row) => row.clubId === clubId);
}

function toDynamoSnapshot(
  dynamo: StandingsRow,
  tournament: string,
  totalTeams: number,
): TeamStandingsSnapshot {
  return {
    position: dynamo.position,
    points: dynamo.points,
    played: dynamo.matches,
    wins: dynamo.wins,
    draws: dynamo.draws,
    losses: dynamo.losses,
    goalDifference: dynamo.goalDifference,
    tournament: tournament || null,
    totalTeams,
  };
}

export async function getHomeMatchStandings(): Promise<
  Record<MatchTeamSlug, TeamStandingsBundle | null>
> {
  const slugs = Object.keys(COMET_STANDINGS_IDS) as MatchTeamSlug[];

  const pairs = await Promise.all(
    slugs.map(async (slug) => {
      const cometId = COMET_STANDINGS_IDS[slug];
      const data = await fetchCometStandings(cometId);
      if (!data) return [slug, null] as const;

      const positionsByClubId = buildPositionsMap(data.standings);
      const dynamoRow = findDynamoStanding(data.standings, cometId);
      const dynamo = dynamoRow
        ? toDynamoSnapshot(dynamoRow, data.tournament, data.standings.length)
        : null;

      const bundle: TeamStandingsBundle = { dynamo, positionsByClubId };
      return [slug, bundle] as const;
    }),
  );

  return Object.fromEntries(pairs) as Record<MatchTeamSlug, TeamStandingsBundle | null>;
}
