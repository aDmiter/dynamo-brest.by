/** Публичное название клуба на сайте (не админское имя состава в БД) */
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

/** Названия команд для UI: наш состав из `team.name`, соперник из OpponentTeam по cometId */
export function resolveMatchTeamNames(
  match: MatchTeamsSource,
  ourTeamName: string,
  opponentMap: OpponentTeamMap
) {
  return {
    homeTeam: match.isHome
      ? ourTeamName
      : (match.homeTeamId && opponentMap[match.homeTeamId]?.name) || match.homeTeam,
    awayTeam: match.isHome
      ? (match.awayTeamId && opponentMap[match.awayTeamId]?.name) || match.awayTeam
      : ourTeamName,
  };
}
