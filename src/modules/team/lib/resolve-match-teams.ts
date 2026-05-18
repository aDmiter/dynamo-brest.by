/** Публичное название основного состава (билеты, брендинг) */
export const DYNAMO_BREST_DISPLAY_NAME = 'Динамо-Брест';

type OpponentRow = {
  cometId: number | null;
  name: string;
  logoUrl?: string | null;
};

export type OpponentTeamMap = Record<number, { name: string; logoUrl: string | null }>;

export type MatchTeamsSource = {
  isHome: boolean;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: number | null;
  awayTeamId: number | null;
};

export function buildOpponentTeamMap(opponents: OpponentRow[]): OpponentTeamMap {
  const teamMap: OpponentTeamMap = {};
  for (const opp of opponents) {
    if (opp.cometId != null) {
      teamMap[opp.cometId] = { name: opp.name, logoUrl: opp.logoUrl ?? null };
    }
  }
  return teamMap;
}

function nameByCometId(
  teamId: number | null,
  fallback: string,
  opponentMap: OpponentTeamMap
): string {
  if (teamId == null) return fallback;
  return opponentMap[teamId]?.name ?? fallback;
}

/** Названия хозяев и гостей из OpponentTeam по homeTeamId / awayTeamId */
export function resolveMatchTeamNames(match: MatchTeamsSource, opponentMap: OpponentTeamMap) {
  return {
    homeTeam: nameByCometId(match.homeTeamId, match.homeTeam, opponentMap),
    awayTeam: nameByCometId(match.awayTeamId, match.awayTeam, opponentMap),
  };
}

export function resolveMatchLogos(
  match: Pick<MatchTeamsSource, 'isHome' | 'homeTeamId' | 'awayTeamId'>,
  opponentMap: OpponentTeamMap
) {
  return {
    homeLogoUrl: match.isHome
      ? null
      : (match.homeTeamId && opponentMap[match.homeTeamId]?.logoUrl) || null,
    awayLogoUrl: match.isHome
      ? (match.awayTeamId && opponentMap[match.awayTeamId]?.logoUrl) || null
      : null,
  };
}

type SerializableMatch = MatchTeamsSource & {
  matchDate: Date;
  createdAt: Date;
  updatedAt: Date;
};

export function serializeTeamMatchesForPublic<T extends SerializableMatch>(
  matches: T[],
  opponentMap: OpponentTeamMap
) {
  return matches.map((m) => {
    const { homeTeam, awayTeam } = resolveMatchTeamNames(m, opponentMap);
    const logos = resolveMatchLogos(m, opponentMap);
    return {
      ...m,
      matchDate: m.matchDate.toISOString(),
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
      homeTeam,
      awayTeam,
      ...logos,
    };
  });
}
