import { prisma } from '@/lib/prisma';

const OUR_CLUB_COMET_IDS = new Set([68812, 102734, 101132]);

export interface AdminProtocolLineup {
  id: string;
  personCometId: string;
  personName: string;
  playerId: string | null;
  shirtNumber: number | null;
  startingLineup: boolean;
  played: boolean;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number | null;
  position: string | null;
}

export interface AdminProtocolGoal {
  id: string;
  minute: number | null;
  displayMinute: string | null;
  scorerPersonCometId: string | null;
  scorerName: string | null;
  assistPersonCometId: string | null;
  assistName: string | null;
}

export interface AdminProtocolPayload {
  matchId: string;
  ourClubCometId: number | null;
  lineups: AdminProtocolLineup[];
  goals: AdminProtocolGoal[];
  hasProtocol: boolean;
}

export interface SaveAdminProtocolLineup {
  id: string;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number | null;
  played: boolean;
  startingLineup: boolean;
  shirtNumber: number | null;
}

export interface SaveAdminProtocolGoal {
  id?: string;
  minute: number | null;
  displayMinute?: string | null;
  scorerPersonCometId: string;
  assistPersonCometId?: string | null;
}

export interface SaveAdminProtocolInput {
  lineups: SaveAdminProtocolLineup[];
  goals: SaveAdminProtocolGoal[];
}

function isGoalEventType(eventType: string): boolean {
  const t = eventType.toLowerCase();
  return t.includes('гол') && !t.includes('автогол');
}

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

type LineupRow = {
  id: string;
  personCometId: string;
  personName: string;
  playerId: string | null;
  shirtNumber: number | null;
  teamCometId: number | null;
  startingLineup: boolean;
  played: boolean;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number | null;
  player: { position: string | null } | null;
};

function filterOurLineups(lineups: LineupRow[], ourClubId: number | null): LineupRow[] {
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

function isOurGoalEvent(
  e: { teamCometId: number | null; personCometId: string | null },
  ourClubId: number | null,
  ourPersonIds: Set<string>
): boolean {
  if (ourClubId != null && e.teamCometId === ourClubId) return true;
  if (e.personCometId && ourPersonIds.has(e.personCometId)) return true;
  return false;
}

function goalsFromLineups(rows: LineupRow[]): AdminProtocolGoal[] {
  const result: AdminProtocolGoal[] = [];
  let idx = 0;
  for (const row of rows) {
    for (let i = 0; i < row.goals; i++) {
      result.push({
        id: `lineup-${row.personCometId}-${idx++}`,
        minute: null,
        displayMinute: null,
        scorerPersonCometId: row.personCometId,
        scorerName: row.personName,
        assistPersonCometId: null,
        assistName: null,
      });
    }
  }
  return result;
}

export async function getAdminMatchProtocol(matchId: string): Promise<AdminProtocolPayload | null> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      team: { select: { cometId: true } },
      lineups: {
        include: { player: { select: { position: true } } },
        orderBy: [{ startingLineup: 'desc' }, { shirtNumber: 'asc' }],
      },
      events: { orderBy: [{ sortOrder: 'asc' }, { minute: 'asc' }] },
    },
  });

  if (!match) return null;

  const ourClubId = resolveOurClubCometId(match);
  const ourRows = filterOurLineups(match.lineups as LineupRow[], ourClubId);
  const ourPersonIds = new Set(ourRows.map((r) => r.personCometId));

  const lineups: AdminProtocolLineup[] = ourRows.map((r) => ({
    id: r.id,
    personCometId: r.personCometId,
    personName: r.personName,
    playerId: r.playerId,
    shirtNumber: r.shirtNumber,
    startingLineup: r.startingLineup,
    played: r.played,
    goals: r.goals,
    assists: r.assists,
    yellowCards: r.yellowCards,
    redCards: r.redCards,
    minutesPlayed: r.minutesPlayed,
    position: r.player?.position ?? null,
  }));

  const goalEvents = match.events.filter(
    (e) => isGoalEventType(e.eventType) && isOurGoalEvent(e, ourClubId, ourPersonIds)
  );

  let goals: AdminProtocolGoal[] = goalEvents.map((e) => ({
    id: e.id,
    minute: e.minute,
    displayMinute: e.displayMinute,
    scorerPersonCometId: e.personCometId,
    scorerName: e.personName,
    assistPersonCometId: e.relatedPersonCometId,
    assistName: e.relatedPersonName,
  }));

  if (goals.length === 0 && ourRows.some((r) => r.goals > 0)) {
    goals = goalsFromLineups(ourRows);
  }

  return {
    matchId,
    ourClubCometId: ourClubId,
    lineups,
    goals,
    hasProtocol: lineups.length > 0,
  };
}

function personNameByCometId(lineups: LineupRow[], cometId: string): string {
  return lineups.find((r) => r.personCometId === cometId)?.personName ?? '';
}

function countGoalsAssists(goals: SaveAdminProtocolGoal[]) {
  const goalsByPerson = new Map<string, number>();
  const assistsByPerson = new Map<string, number>();
  for (const g of goals) {
    if (!g.scorerPersonCometId) continue;
    goalsByPerson.set(
      g.scorerPersonCometId,
      (goalsByPerson.get(g.scorerPersonCometId) ?? 0) + 1
    );
    if (g.assistPersonCometId) {
      assistsByPerson.set(
        g.assistPersonCometId,
        (assistsByPerson.get(g.assistPersonCometId) ?? 0) + 1
      );
    }
  }
  return { goalsByPerson, assistsByPerson };
}

export async function saveAdminMatchProtocol(
  matchId: string,
  input: SaveAdminProtocolInput
): Promise<{ success: true } | { success: false; error: string }> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      team: { select: { cometId: true } },
      lineups: {
        include: { player: { select: { position: true } } },
      },
      events: true,
    },
  });

  if (!match) return { success: false, error: 'Матч не найден' };

  const ourClubId = resolveOurClubCometId(match);
  const ourRows = filterOurLineups(match.lineups as LineupRow[], ourClubId);
  const ourPersonIds = new Set(ourRows.map((r) => r.personCometId));
  const lineupById = new Map(ourRows.map((r) => [r.id, r]));

  const validGoals = input.goals.filter((g) => g.scorerPersonCometId && ourPersonIds.has(g.scorerPersonCometId));
  const { goalsByPerson, assistsByPerson } = countGoalsAssists(validGoals);

  for (const row of input.lineups) {
    if (!lineupById.has(row.id)) continue;
    const personCometId = lineupById.get(row.id)!.personCometId;
    await prisma.matchLineup.update({
      where: { id: row.id },
      data: {
        yellowCards: Math.max(0, row.yellowCards),
        redCards: Math.max(0, row.redCards),
        minutesPlayed: row.minutesPlayed,
        played: row.played,
        startingLineup: row.startingLineup,
        shirtNumber: row.shirtNumber,
        goals: goalsByPerson.get(personCometId) ?? 0,
        assists: assistsByPerson.get(personCometId) ?? 0,
      },
    });
  }

  const ourGoalEventIds = match.events
    .filter((e) => isGoalEventType(e.eventType) && isOurGoalEvent(e, ourClubId, ourPersonIds))
    .map((e) => e.id);

  if (ourGoalEventIds.length > 0) {
    await prisma.matchEvent.deleteMany({ where: { id: { in: ourGoalEventIds } } });
  }

  const maxSort = match.events.reduce((m, e) => Math.max(m, e.sortOrder), -1);
  let sortOrder = maxSort + 1;

  for (const g of validGoals) {
    const scorerName = personNameByCometId(ourRows, g.scorerPersonCometId);
    const assistId = g.assistPersonCometId?.trim() || null;
    const assistName =
      assistId && ourPersonIds.has(assistId) ? personNameByCometId(ourRows, assistId) : null;

    await prisma.matchEvent.create({
      data: {
        matchId,
        personCometId: g.scorerPersonCometId,
        personName: scorerName || null,
        relatedPersonCometId: assistName ? assistId : null,
        relatedPersonName: assistName,
        teamCometId: ourClubId,
        eventType: 'Гол',
        eventSubType: null,
        minute: g.minute,
        displayMinute: g.displayMinute?.trim() || (g.minute != null ? `${g.minute}'` : null),
        sortOrder: sortOrder++,
      },
    });
  }

  return { success: true };
}
