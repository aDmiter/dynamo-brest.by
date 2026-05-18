import { prisma } from '@/lib/prisma';
import { resolveMatchTeamNames, type OpponentTeamMap } from '@/modules/team/lib/resolve-match-teams';

export interface GoalScorerPublic {
  minute: string;
  name: string;
  personCometId: string | null;
}

export type ProtocolSubstitution = 'in' | 'out';

export interface ProtocolPlayer {
  personCometId: string;
  surname: string;
  firstName: string;
  shirtNumber: number | null;
  photoUrl: string | null;
  slug: string | null;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number | null;
  startingLineup: boolean;
  played: boolean;
  isGoalkeeper: boolean;
  substitution: ProtocolSubstitution | null;
  substitutionMinute: string | null;
}

export interface ProtocolEvent {
  id: string;
  minute: string;
  eventType: string;
  eventSubType: string | null;
  personName: string | null;
  personCometId: string | null;
  teamSide: 'home' | 'away' | null;
  kind: 'goal' | 'card' | 'substitution' | 'other';
}

export interface MatchProtocolPayload {
  match: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    matchDate: string;
    tournament: string | null;
    round: string | null;
    stadium: string | null;
    attendance: number | null;
  };
  squad: {
    teamName: string;
    starters: ProtocolPlayer[];
    substitutes: ProtocolPlayer[];
  };
  timeline: ProtocolEvent[];
}

const OUR_CLUB_COMET_IDS = new Set([68812, 102734, 101132]);

function resolveOurClubCometId(match: {
  isHome: boolean;
  homeTeamId: number | null;
  awayTeamId: number | null;
  team: { cometId: string | null } | null;
}): number | null {
  if (match.isHome && match.homeTeamId != null) return match.homeTeamId;
  if (!match.isHome && match.awayTeamId != null) return match.awayTeamId;
  const fromTeam = match.team?.cometId ? parseInt(match.team.cometId, 10) : null;
  return fromTeam != null && !Number.isNaN(fromTeam) ? fromTeam : null;
}

function filterOurLineups(lineups: LineupDbRow[], ourClubId: number | null): LineupDbRow[] {
  if (ourClubId != null) {
    return lineups.filter(
      (r) =>
        r.teamCometId === ourClubId ||
        (r.teamCometId == null && r.playerId != null) ||
        (r.teamCometId != null && OUR_CLUB_COMET_IDS.has(r.teamCometId) && r.playerId != null)
    );
  }
  return lineups.filter((r) => r.playerId != null);
}

function formatMinute(displayMinute: string | null, minute: number | null): string {
  if (displayMinute?.trim()) return displayMinute.trim();
  if (minute != null) return `${minute}'`;
  return '';
}

function teamSide(
  teamCometId: number | null,
  homeTeamId: number | null,
  awayTeamId: number | null
): 'home' | 'away' | null {
  if (teamCometId == null) return null;
  if (homeTeamId === teamCometId) return 'home';
  if (awayTeamId === teamCometId) return 'away';
  return null;
}

type LineupDbRow = {
  personCometId: string;
  personName: string;
  shirtNumber: number | null;
  teamCometId: number | null;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number | null;
  startingLineup: boolean;
  played: boolean;
  playerId: string | null;
  player: {
    photoUrl: string | null;
    position: string | null;
    slug: string | null;
    firstName: string;
    lastName: string;
  } | null;
};

function resolvePlayerNames(row: LineupDbRow): { surname: string; firstName: string } {
  if (row.player?.lastName) {
    return { surname: row.player.lastName, firstName: row.player.firstName };
  }
  const parts = row.personName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { surname: row.personName.trim(), firstName: '' };
  return { surname: parts[0], firstName: parts[1] ?? '' };
}

type SubstitutionInfo = { type: ProtocolSubstitution; minute: string };

function isSubstitutionEvent(eventType: string, eventSubType: string | null): boolean {
  const t = `${eventType} ${eventSubType ?? ''}`.toLowerCase();
  return t.includes('замен') || t.includes('substitut') || /\bsub\b/.test(t);
}

function parseSubstitutionDirection(
  eventType: string,
  eventSubType: string | null
): ProtocolSubstitution | null {
  const combined = `${eventType} ${eventSubType ?? ''}`.toLowerCase();
  if (!combined.includes('замен') && !eventSubType) return null;

  const st = (eventSubType ?? '').toLowerCase();
  if (
    /вошел|вошёл|зашел|зашёл|вышел на поле|\bin\b|\bon\b/.test(combined) ||
    st === 'in' ||
    st === 'on'
  ) {
    return 'in';
  }
  if (
    /вышел|снят|уходит|уход|\bout\b|\boff\b|заменён|заменен/.test(combined) ||
    st === 'out' ||
    st === 'off'
  ) {
    return 'out';
  }
  return null;
}

function inferSubstitutionsFromLineup(
  rows: LineupDbRow[],
  existing: Map<string, SubstitutionInfo>
): Map<string, SubstitutionInfo> {
  const result = new Map(existing);

  for (const row of rows) {
    if (result.has(row.personCometId)) continue;

    const mins = row.minutesPlayed;
    const leftEarly =
      row.startingLineup &&
      row.played &&
      mins != null &&
      mins > 0 &&
      mins < 90;

    if (leftEarly) {
      result.set(row.personCometId, {
        type: 'out',
        minute: formatMinute(null, mins),
      });
      continue;
    }

    if (!row.startingLineup && row.played) {
      result.set(row.personCometId, { type: 'in', minute: '' });
    }
  }

  return result;
}

function buildSubstitutionMap(
  events: Array<{
    personCometId: string | null;
    eventType: string;
    eventSubType: string | null;
    displayMinute: string | null;
    minute: number | null;
  }>,
  lineupByPerson: Map<string, { startingLineup: boolean }>,
  rows: LineupDbRow[]
): Map<string, SubstitutionInfo> {
  const result = new Map<string, SubstitutionInfo>();

  for (const e of events) {
    if (!e.personCometId || !isSubstitutionEvent(e.eventType, e.eventSubType)) continue;

    const minute = formatMinute(e.displayMinute, e.minute);
    let type = parseSubstitutionDirection(e.eventType, e.eventSubType);
    if (!type) {
      const lineup = lineupByPerson.get(e.personCometId);
      if (lineup) type = lineup.startingLineup ? 'out' : 'in';
    }
    if (!type) continue;

    result.set(e.personCometId, { type, minute });
  }

  return inferSubstitutionsFromLineup(rows, result);
}

function eventKind(eventType: string, eventSubType: string | null): ProtocolEvent['kind'] {
  const t = eventType.toLowerCase();
  if (t.includes('гол') && !t.includes('автогол')) return 'goal';
  if (t.includes('карт')) return 'card';
  if (isSubstitutionEvent(eventType, eventSubType)) return 'substitution';
  return 'other';
}

function isGoalkeeperRow(row: LineupDbRow): boolean {
  return row.player?.position === 'Вратарь';
}

function sortSquadPlayers(players: ProtocolPlayer[]): ProtocolPlayer[] {
  return [...players].sort((a, b) => {
    if (a.isGoalkeeper !== b.isGoalkeeper) return a.isGoalkeeper ? -1 : 1;
    return (a.shirtNumber ?? 99) - (b.shirtNumber ?? 99);
  });
}

function splitSquad(rows: LineupDbRow[], substitutions: Map<string, SubstitutionInfo>) {
  return {
    starters: sortSquadPlayers(
      rows.filter((r) => r.startingLineup).map((r) => mapLineupPlayer(r, substitutions))
    ),
    substitutes: sortSquadPlayers(
      rows.filter((r) => !r.startingLineup).map((r) => mapLineupPlayer(r, substitutions))
    ),
  };
}

function mapLineupPlayer(
  row: LineupDbRow,
  substitutions: Map<string, SubstitutionInfo>
): ProtocolPlayer {
  const sub = substitutions.get(row.personCometId);
  const { surname, firstName } = resolvePlayerNames(row);
  return {
    personCometId: row.personCometId,
    surname,
    firstName,
    shirtNumber: row.shirtNumber,
    photoUrl: row.player?.photoUrl ?? null,
    slug: row.player?.slug ?? null,
    goals: row.goals,
    assists: row.assists,
    yellowCards: row.yellowCards,
    redCards: row.redCards,
    minutesPlayed: row.minutesPlayed,
    startingLineup: row.startingLineup,
    played: row.played,
    isGoalkeeper: isGoalkeeperRow(row),
    substitution: sub?.type ?? null,
    substitutionMinute: sub?.minute ?? null,
  };
}

export async function getMatchProtocol(
  matchId: string,
  opponentMap: OpponentTeamMap
): Promise<MatchProtocolPayload | null> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      team: { select: { cometId: true } },
      lineups: {
        include: {
          player: {
            select: {
              photoUrl: true,
              position: true,
              slug: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: [{ startingLineup: 'desc' }, { shirtNumber: 'asc' }],
      },
      events: { orderBy: [{ sortOrder: 'asc' }, { minute: 'asc' }] },
    },
  });

  if (!match) return null;

  const { homeTeam, awayTeam } = resolveMatchTeamNames(match, opponentMap);

  const homeId = match.homeTeamId;
  const awayId = match.awayTeamId;
  const ourClubId = resolveOurClubCometId(match);
  const ourSide: 'home' | 'away' | null = match.isHome ? 'home' : 'away';
  const ourTeamName = match.isHome ? homeTeam : awayTeam;

  const ourRows = filterOurLineups(match.lineups as LineupDbRow[], ourClubId);
  const lineupByPerson = new Map(
    ourRows.map((r) => [r.personCometId, { startingLineup: r.startingLineup }])
  );
  const ourEvents = match.events.filter((e) => {
    const side = teamSide(e.teamCometId, homeId, awayId);
    return side == null || side === ourSide;
  });
  const substitutions = buildSubstitutionMap(ourEvents, lineupByPerson, ourRows);
  const squad = { teamName: ourTeamName, ...splitSquad(ourRows, substitutions) };

  const timeline: ProtocolEvent[] = ourEvents.map((e) => ({
    id: e.id,
    minute: formatMinute(e.displayMinute, e.minute),
    eventType: e.eventType,
    eventSubType: e.eventSubType,
    personName: e.personName,
    personCometId: e.personCometId,
    teamSide: teamSide(e.teamCometId, homeId, awayId),
    kind: eventKind(e.eventType, e.eventSubType),
  }));

  return {
    match: {
      id: match.id,
      homeTeam,
      awayTeam,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      matchDate: match.matchDate.toISOString(),
      tournament: match.tournament,
      round: match.round,
      stadium: match.stadium,
      attendance: match.attendance,
    },
    squad,
    timeline,
  };
}

export async function getGoalsByMatchIds(
  matchIds: string[],
  homeTeamIds: Map<string, number | null>,
  awayTeamIds: Map<string, number | null>
): Promise<Map<string, { home: GoalScorerPublic[]; away: GoalScorerPublic[] }>> {
  const result = new Map<string, { home: GoalScorerPublic[]; away: GoalScorerPublic[] }>();

  if (matchIds.length === 0) return result;

  const events = await prisma.matchEvent.findMany({
    where: { matchId: { in: matchIds } },
    orderBy: [{ matchId: 'asc' }, { sortOrder: 'asc' }, { minute: 'asc' }],
  });

  for (const id of matchIds) {
    result.set(id, { home: [], away: [] });
  }

  for (const e of events) {
    const type = e.eventType.toLowerCase();
    if (!type.includes('гол') || type.includes('автогол')) continue;

    const bucket = result.get(e.matchId);
    if (!bucket) continue;

    const entry: GoalScorerPublic = {
      minute: formatMinute(e.displayMinute, e.minute),
      name: e.personName || '—',
      personCometId: e.personCometId,
    };

    const homeId = homeTeamIds.get(e.matchId);
    const awayId = awayTeamIds.get(e.matchId);

    if (e.teamCometId != null && homeId === e.teamCometId) {
      bucket.home.push(entry);
    } else if (e.teamCometId != null && awayId === e.teamCometId) {
      bucket.away.push(entry);
    } else {
      bucket.home.push(entry);
    }
  }

  return result;
}
