import { prisma } from '@/lib/prisma';
import { fetchAllCometReport } from '@/lib/comet-fetch';

export interface PersonLookup {
  name: string;
  photoUrl: string | null;
  playerId: string | null;
}

function num(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : parseInt(String(v), 10);
  return Number.isFinite(n) ? n : null;
}

function str(v: unknown): string {
  return v == null ? '' : String(v);
}

function isGoalEvent(eventType: string): boolean {
  const t = eventType.toLowerCase();
  return t.includes('гол') && !t.includes('автогол');
}

function isCardEvent(eventType: string): boolean {
  const t = eventType.toLowerCase();
  return t.includes('карт');
}

function isSubstitutionEvent(eventType: string, subType: string): boolean {
  const t = `${eventType} ${subType}`.toLowerCase();
  return t.includes('замен') || t.includes('substitut') || /\bsub\b/.test(t);
}

function eventSortKey(minute: number | null, displayMinute: string | null): number {
  if (minute != null) return minute;
  const m = displayMinute?.match(/\d+/);
  return m ? parseInt(m[0], 10) : 999;
}

export async function buildPersonLookup(): Promise<Map<string, PersonLookup>> {
  const map = new Map<string, PersonLookup>();

  const dbPlayers = await prisma.player.findMany({
    where: { cometId: { not: null } },
    select: { id: true, cometId: true, firstName: true, lastName: true, photoUrl: true },
  });

  for (const p of dbPlayers) {
    if (!p.cometId) continue;
    map.set(p.cometId, {
      name: `${p.lastName} ${p.firstName}`.trim(),
      photoUrl: p.photoUrl,
      playerId: p.id,
    });
  }

  return map;
}

export async function syncMatchProtocolData(): Promise<string[]> {
  const logs: string[] = [];
  const { getSetting } = await import('@/lib/settings');

  const statsKey =
    (await getSetting('COMET_API_KEY_PLAYER_STATS')) ||
    process.env.COMET_API_KEY_PLAYER_STATS ||
    '';
  const eventsKey =
    (await getSetting('COMET_API_KEY_MATCH_EVENTS')) ||
    process.env.COMET_API_KEY_MATCH_EVENTS ||
    '';

  if (!statsKey || !eventsKey) {
    throw new Error('Нужны ключи COMET_API_KEY_PLAYER_STATS и COMET_API_KEY_MATCH_EVENTS');
  }

  const finishedMatches = await prisma.match.findMany({
    where: { cometId: { not: null }, status: 'finished' },
    select: { id: true, cometId: true, homeTeamId: true, awayTeamId: true },
  });

  const cometToMatch = new Map(
    finishedMatches
      .filter((m) => m.cometId)
      .map((m) => [m.cometId as string, m] as const)
  );

  logs.push(`Матчей в БД (сыграно): ${finishedMatches.length}`);

  const personLookup = await buildPersonLookup();
  logs.push(`Игроков в справочнике: ${personLookup.size}`);

  // Дополняем справочник из отчёта игроков (соперники)
  try {
    const playersKey =
      (await getSetting('COMET_API_KEY_PLAYERS')) || process.env.COMET_API_KEY_PLAYERS || '';
    if (playersKey) {
      const playersReport = await fetchAllCometReport(playersKey);
      for (const row of playersReport) {
        const pid = str(row.personId);
        if (!pid || personLookup.has(pid)) continue;
        const first = str(row.firstName);
        const last = str(row.lastName);
        if (first || last) {
          personLookup.set(pid, {
            name: `${last} ${first}`.trim(),
            photoUrl: str(row.photo) || null,
            playerId: null,
          });
        }
      }
      logs.push(`Справочник после отчёта игроков: ${personLookup.size}`);
    }
  } catch {
    logs.push('⚠️ Отчёт игроков не загружен (имена соперников могут быть сокращены)');
  }

  const nameFromRow = (row: Record<string, unknown>): string | null => {
    const last = str(row.lastName);
    const first = str(row.firstName);
    if (last || first) return `${last} ${first}`.trim();
    const full = str(row.playerName) || str(row.personName) || str(row.name);
    return full || null;
  };

  const resolvePerson = (
    personId: unknown,
    row: Record<string, unknown>,
    shirtNumber?: number | null
  ): PersonLookup => {
    const pid = str(personId);
    if (pid && personLookup.has(pid)) return personLookup.get(pid)!;
    const fromRow = nameFromRow(row);
    if (fromRow) return { name: fromRow, photoUrl: null, playerId: null };
    const label = shirtNumber ? `Игрок №${shirtNumber}` : 'Игрок';
    return { name: label, photoUrl: null, playerId: null };
  };

  logs.push('Загрузка составов (Player Appearances)...');
  const appearances = await fetchAllCometReport(statsKey);
  let lineupUpserts = 0;

  for (const row of appearances) {
    const cometMatchId = str(row.matchId);
    const match = cometToMatch.get(cometMatchId);
    if (!match) continue;

    const personCometId = str(row.personId);
    if (!personCometId) continue;

    const person = resolvePerson(personCometId, row, num(row.shirtNumber));
    const teamCometId = num(row.clubId) ?? num(row.teamId);

    await prisma.matchLineup.upsert({
      where: {
        matchId_personCometId: { matchId: match.id, personCometId },
      },
      create: {
        matchId: match.id,
        personCometId,
        personName: person.name,
        teamCometId,
        shirtNumber: num(row.shirtNumber),
        startingLineup: row.startingLineup === 1,
        played: row.played === 1,
        goals: num(row.goals) ?? 0,
        yellowCards: num(row.singleYellow) ?? 0,
        redCards: num(row.redCards) ?? 0,
        minutesPlayed: num(row.minutesPlayed),
        playerId: person.playerId,
      },
      update: {
        personName: person.name,
        teamCometId,
        shirtNumber: num(row.shirtNumber),
        startingLineup: row.startingLineup === 1,
        played: row.played === 1,
        goals: num(row.goals) ?? 0,
        yellowCards: num(row.singleYellow) ?? 0,
        redCards: num(row.redCards) ?? 0,
        minutesPlayed: num(row.minutesPlayed),
        playerId: person.playerId,
      },
    });
    lineupUpserts++;
  }

  logs.push(`Составов обновлено: ${lineupUpserts}`);

  logs.push('Загрузка событий матчей...');
  const events = await fetchAllCometReport(eventsKey);

  const matchIds = [...new Set(finishedMatches.map((m) => m.id))];
  if (matchIds.length > 0) {
    await prisma.matchEvent.deleteMany({ where: { matchId: { in: matchIds } } });
  }

  const eventsByMatch = new Map<string, typeof events>();
  for (const row of events) {
    const cometMatchId = str(row.matchId);
    const match = cometToMatch.get(cometMatchId);
    if (!match) continue;
    if (!eventsByMatch.has(match.id)) eventsByMatch.set(match.id, []);
    eventsByMatch.get(match.id)!.push(row);
  }

  let eventCreates = 0;

  for (const [matchId, matchEvents] of eventsByMatch) {
    const sorted = [...matchEvents].sort((a, b) => {
      const ka = eventSortKey(num(a.minute), str(a.displayMinute) || null);
      const kb = eventSortKey(num(b.minute), str(b.displayMinute) || null);
      return ka - kb;
    });

    for (let i = 0; i < sorted.length; i++) {
      const row = sorted[i];
      const eventType = str(row.matchEventType);
      if (!eventType) continue;

      const subType = str(row.eventSubType);
      if (
        !isGoalEvent(eventType) &&
        !isCardEvent(eventType) &&
        !isSubstitutionEvent(eventType, subType)
      ) {
        continue;
      }

      const personCometId = str(row.personId) || null;
      const person = personCometId ? resolvePerson(personCometId, row) : null;

      await prisma.matchEvent.create({
        data: {
          matchId,
          personCometId,
          personName: person?.name ?? null,
          teamCometId: num(row.teamId) ?? num(row.clubId),
          eventType,
          eventSubType: subType || null,
          minute: num(row.minute),
          displayMinute: str(row.displayMinute) || null,
          sortOrder: i,
        },
      });
      eventCreates++;
    }
  }

  logs.push(`Событий сохранено: ${eventCreates}`);
  return logs;
}
