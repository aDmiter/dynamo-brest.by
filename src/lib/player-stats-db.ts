import { prisma } from '@/lib/prisma';
import {
  buildOpponentTeamMap,
  resolveMatchTeamNames,
  type OpponentTeamMap,
} from '@/modules/team/lib/resolve-match-teams';

export const TEAM_CLUB_IDS: Record<string, number> = {
  'osnovnoy-sostav': 68812,
  'dubliruyushchiy-sostav': 102734,
  'zhenskaya-komanda': 101132,
};

export interface PlayerAppearanceRow {
  date: number;
  match: string;
  competition: string;
  round: string;
  shirtNumber: number;
  startingLineup: boolean;
  played: boolean;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  result: string;
  goalkeeper: number;
}

export interface PlayerStatsTotals {
  appearances: number;
  goals: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  startedMatches: number;
  subAppearances: number;
  cleanSheets: number;
  goalsConceded: number;
  assists: number;
}

export interface PlayerStatsPayload {
  success: true;
  source: 'database';
  player: {
    id: string;
    name: string;
    position: string | null;
  };
  totals: PlayerStatsTotals;
  byCompetition: Record<string, PlayerStatsTotals>;
  appearances: PlayerAppearanceRow[];
}

export interface PlayerCardStats {
  appearances: number;
  goals: number;
  cleanSheets?: number;
  goalsConceded?: number;
  assists?: number;
}

type MatchRow = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeScore: number | null;
  awayScore: number | null;
  matchDate: Date;
  tournament: string | null;
  round: string | null;
  isHome: boolean;
  teamId: string;
};

type LineupRow = {
  id: string;
  matchId: string;
  playerId: string | null;
  personCometId: string;
  shirtNumber: number | null;
  startingLineup: boolean;
  played: boolean;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number | null;
  teamCometId: number | null;
  match: MatchRow;
};

function seasonRange(year: number) {
  return {
    gte: new Date(`${year}-01-01T00:00:00.000Z`),
    lte: new Date(`${year}-12-31T23:59:59.999Z`),
  };
}

function resolveClubId(teamSlug: string | null, teamCometId: string | null): number | null {
  if (teamSlug && TEAM_CLUB_IDS[teamSlug]) return TEAM_CLUB_IDS[teamSlug];
  if (teamCometId) {
    const n = parseInt(teamCometId, 10);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function formatMatchLabel(match: MatchRow, opponentMap: OpponentTeamMap): string {
  const { homeTeam, awayTeam } = resolveMatchTeamNames(match, opponentMap);
  return `${homeTeam} — ${awayTeam}`;
}

function computeResult(match: MatchRow, clubId: number | null): string {
  if (match.homeScore == null || match.awayScore == null || clubId == null) return '';
  const isOurHome = match.homeTeamId === clubId;
  const ours = isOurHome ? match.homeScore : match.awayScore;
  const theirs = isOurHome ? match.awayScore : match.homeScore;
  if (ours > theirs) return 'W';
  if (ours === theirs) return 'D';
  return 'L';
}

function goalsConcededInMatch(match: MatchRow, clubId: number | null): number {
  if (match.homeScore == null || match.awayScore == null || clubId == null) return 0;
  return match.homeTeamId === clubId ? match.awayScore : match.homeScore;
}

function emptyTotals(): PlayerStatsTotals {
  return {
    appearances: 0,
    goals: 0,
    yellowCards: 0,
    redCards: 0,
    minutesPlayed: 0,
    startedMatches: 0,
    subAppearances: 0,
    cleanSheets: 0,
    goalsConceded: 0,
    assists: 0,
  };
}

function lineupWhere(
  playerId: string,
  cometId: string | null,
  options: {
    teamId?: string;
    teamSlug?: string;
    seasonYear?: number;
  }
) {
  const clubId = options.teamSlug ? TEAM_CLUB_IDS[options.teamSlug] : null;
  const year = options.seasonYear ?? new Date().getFullYear();

  return {
    OR: [
      { playerId },
      ...(cometId ? [{ personCometId: cometId }] : []),
    ],
    match: {
      status: 'finished' as const,
      matchDate: seasonRange(year),
      ...(options.teamId ? { teamId: options.teamId } : {}),
      ...(clubId
        ? {
            OR: [{ homeTeamId: clubId }, { awayTeamId: clubId }],
          }
        : {}),
    },
  };
}

function buildAppearances(
  lineups: LineupRow[],
  clubId: number | null,
  isGoalkeeper: boolean,
  opponentMap: OpponentTeamMap
): PlayerAppearanceRow[] {
  const rows = lineups
    .filter((l) => l.played)
    .map((l) => ({
      date: l.match.matchDate.getTime(),
      match: formatMatchLabel(l.match, opponentMap),
      competition: l.match.tournament || 'Другое',
      round: l.match.round || '',
      shirtNumber: l.shirtNumber ?? 0,
      startingLineup: l.startingLineup,
      played: l.played,
      goals: l.goals,
      assists: l.assists,
      yellowCards: l.yellowCards,
      redCards: l.redCards,
      minutesPlayed: l.minutesPlayed ?? 0,
      result: computeResult(l.match, clubId),
      goalkeeper: isGoalkeeper ? 1 : 0,
    }));

  rows.sort((a, b) => b.date - a.date);
  return rows;
}

function aggregateTotals(
  appearances: PlayerAppearanceRow[],
  lineups: LineupRow[],
  clubId: number | null,
  isGoalkeeper: boolean
): PlayerStatsTotals {
  const totals = emptyTotals();
  totals.appearances = appearances.length;
  totals.goals = appearances.reduce((s, a) => s + a.goals, 0);
  totals.assists = appearances.reduce((s, a) => s + (a.assists ?? 0), 0);
  totals.yellowCards = appearances.reduce((s, a) => s + a.yellowCards, 0);
  totals.redCards = appearances.reduce((s, a) => s + a.redCards, 0);
  totals.minutesPlayed = appearances.reduce((s, a) => s + a.minutesPlayed, 0);
  totals.startedMatches = appearances.filter((a) => a.startingLineup).length;
  totals.subAppearances = appearances.filter((a) => !a.startingLineup).length;

  if (isGoalkeeper && clubId != null) {
    for (const l of lineups) {
      if (!l.played || !l.startingLineup) continue;
      const conceded = goalsConcededInMatch(l.match, clubId);
      totals.goalsConceded += conceded;
      if (conceded === 0) totals.cleanSheets++;
    }
  }

  return totals;
}

function aggregateByCompetition(appearances: PlayerAppearanceRow[]): Record<string, PlayerStatsTotals> {
  const map: Record<string, PlayerStatsTotals> = {};
  for (const a of appearances) {
    const comp = a.competition || 'Другое';
    if (!map[comp]) map[comp] = emptyTotals();
    map[comp].appearances++;
    map[comp].goals += a.goals;
    map[comp].assists += a.assists ?? 0;
    map[comp].yellowCards += a.yellowCards;
    map[comp].redCards += a.redCards;
    map[comp].minutesPlayed += a.minutesPlayed;
    if (a.startingLineup) map[comp].startedMatches++;
    else map[comp].subAppearances++;
  }
  return map;
}

function addGkByCompetition(
  byCompetition: Record<string, PlayerStatsTotals>,
  lineups: LineupRow[],
  clubId: number | null
) {
  for (const l of lineups) {
    if (!l.played || !l.startingLineup || clubId == null) continue;
    const comp = l.match.tournament || 'Другое';
    if (!byCompetition[comp]) byCompetition[comp] = emptyTotals();
    const conceded = goalsConcededInMatch(l.match, clubId);
    byCompetition[comp].goalsConceded += conceded;
    if (conceded === 0) byCompetition[comp].cleanSheets++;
  }
}

export async function getPlayerStatsFromDb(
  playerId: string,
  options: { teamSlug?: string; teamId?: string; seasonYear?: number } = {}
): Promise<PlayerStatsPayload | null> {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: {
      id: true,
      cometId: true,
      firstName: true,
      lastName: true,
      position: true,
      playerTeams: {
        include: { team: { select: { id: true, slug: true, cometId: true } } },
      },
    },
  });

  if (!player) return null;

  const teamSlug =
    options.teamSlug || player.playerTeams[0]?.team.slug || '';
  const teamId = options.teamId || player.playerTeams[0]?.team.id;
  const clubId = resolveClubId(teamSlug, player.playerTeams[0]?.team.cometId ?? null);

  const [lineups, opponentTeams] = await Promise.all([
    prisma.matchLineup.findMany({
    where: lineupWhere(player.id, player.cometId, {
      teamId,
      teamSlug: teamSlug || undefined,
      seasonYear: options.seasonYear,
    }),
    include: {
      match: {
        select: {
          id: true,
          homeTeam: true,
          awayTeam: true,
          homeTeamId: true,
          awayTeamId: true,
          homeScore: true,
          awayScore: true,
          matchDate: true,
          tournament: true,
          round: true,
          isHome: true,
          teamId: true,
        },
      },
    },
    orderBy: { match: { matchDate: 'desc' } },
  }),
    prisma.opponentTeam.findMany({
      where: { isActive: true },
      select: { cometId: true, name: true, logoUrl: true },
    }),
  ]);

  const opponentMap = buildOpponentTeamMap(opponentTeams);

  const isGoalkeeper = player.position === 'Вратарь';
  const appearances = buildAppearances(lineups as LineupRow[], clubId, isGoalkeeper, opponentMap);
  const lineupRows = lineups as LineupRow[];
  const totals = aggregateTotals(appearances, lineupRows, clubId, isGoalkeeper);
  const byCompetition = aggregateByCompetition(appearances);

  if (isGoalkeeper) {
    addGkByCompetition(byCompetition, lineupRows, clubId);
  }

  return {
    success: true,
    source: 'database',
    player: {
      id: player.cometId || player.id,
      name: `${player.lastName} ${player.firstName}`.trim(),
      position: player.position,
    },
    totals,
    byCompetition,
    appearances,
  };
}

export async function getTeamPlayersStatsMap(
  teamId: string,
  teamSlug: string,
  playerIds: string[],
  seasonYear?: number
): Promise<Record<string, PlayerCardStats>> {
  if (playerIds.length === 0) return {};

  const clubId = TEAM_CLUB_IDS[teamSlug] ?? null;
  const year = seasonYear ?? new Date().getFullYear();

  const lineups = (await prisma.matchLineup.findMany({
    where: {
      playerId: { in: playerIds },
      played: true,
      match: {
        status: 'finished',
        teamId,
        matchDate: seasonRange(year),
        ...(clubId
          ? { OR: [{ homeTeamId: clubId }, { awayTeamId: clubId }] }
          : {}),
      },
    },
    include: {
      match: {
        select: {
          id: true,
          homeTeam: true,
          awayTeam: true,
          homeTeamId: true,
          awayTeamId: true,
          homeScore: true,
          awayScore: true,
          matchDate: true,
          tournament: true,
          round: true,
          isHome: true,
          teamId: true,
        },
      },
    },
  })) as LineupRow[];

  const players = await prisma.player.findMany({
    where: { id: { in: playerIds } },
    select: { id: true, position: true },
  });
  const positionById = new Map(players.map((p) => [p.id, p.position]));

  const map: Record<string, PlayerCardStats> = {};
  for (const id of playerIds) {
    map[id] = { appearances: 0, goals: 0, cleanSheets: 0, goalsConceded: 0, assists: 0 };
  }

  const byPlayer = new Map<string, LineupRow[]>();
  for (const l of lineups) {
    if (!l.playerId) continue;
    if (!byPlayer.has(l.playerId)) byPlayer.set(l.playerId, []);
    byPlayer.get(l.playerId)!.push(l);
  }

  for (const [pid, rows] of byPlayer) {
    const isGk = positionById.get(pid) === 'Вратарь';
    const goals = rows.reduce((s, r) => s + r.goals, 0);
    const assists = rows.reduce((s, r) => s + r.assists, 0);
    let cleanSheets = 0;
    let goalsConceded = 0;

    if (isGk && clubId != null) {
      for (const r of rows) {
        if (!r.startingLineup) continue;
        const conceded = goalsConcededInMatch(r.match, clubId);
        goalsConceded += conceded;
        if (conceded === 0) cleanSheets++;
      }
    }

    map[pid] = {
      appearances: rows.length,
      goals,
      cleanSheets,
      goalsConceded,
      assists,
    };
  }

  return map;
}
