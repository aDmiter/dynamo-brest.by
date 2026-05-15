// src/app/api/players/[id]/stats/route.ts - Статистика игрока из COMET
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSetting } from '@/lib/settings';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface CometAppearance {
  personId: number;
  matchId: number;
  date: number;
  matchDescription: string;
  competitionType: string;
  round: string;
  shirtNumber: number;
  goalkeeper: number;
  captain: number;
  startingLineup: number;
  played: number;
  goals: number;
  ownGoals: number;
  singleYellow: number;
  secondYellow: number;
  redCards: number;
  minutesPlayed: number;
  result: string;
  clubId: number;
}

interface CometEvent {
  personId: number;
  matchId: number;
  matchEventType: string;
  eventSubType: string;
  minute: number;
  displayMinute: string;
}

const TEAM_CLUB_IDS: Record<string, number> = {
  'osnovnoy-sostav': 68812,
  'dubliruyushchiy-sostav': 102734,
  'zhenskaya-komanda': 101132,
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const teamSlug = searchParams.get('teamSlug') || '';
    const targetClubId = TEAM_CLUB_IDS[teamSlug] || null;

    const player = await prisma.player.findUnique({
      where: { id },
      select: { cometId: true, firstName: true, lastName: true },
    });

    if (!player || !player.cometId) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    const dbStatsKey = await getSetting('COMET_API_KEY_PLAYER_STATS');
    const envStatsKey = process.env.COMET_API_KEY_PLAYER_STATS || '';
    const STATS_API_KEY = dbStatsKey || envStatsKey;

    const dbEventsKey = await getSetting('COMET_API_KEY_MATCH_EVENTS');
    const envEventsKey = process.env.COMET_API_KEY_MATCH_EVENTS || '';
    const EVENTS_API_KEY = dbEventsKey || envEventsKey;

    const COMET_BASE_URL = process.env.COMET_API_BASE_URL || 'https://comet.abff.by';

    if (!STATS_API_KEY && !EVENTS_API_KEY) {
      return NextResponse.json({ error: 'API keys not configured' }, { status: 500 });
    }

    // 1. Загружаем статистику (Player Appearances)
    let allAppearances: CometAppearance[] = [];

    if (STATS_API_KEY) {
      let page = 0;
      const pageSize = 500;

      do {
        const url = `${COMET_BASE_URL}/data-backend/api/public/areports/run/${page}/${pageSize}/?API_KEY=${STATS_API_KEY}`;

        const response = await fetch(url, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });

        if (!response.ok) break;

        const data = await response.json();

        if (!data.results || data.results.length === 0) break;

        let playerAppearances = data.results.filter(
          (a: Record<string, unknown>) => a.personId?.toString() === player.cometId
        );

        // Фильтруем по клубу, если указан teamSlug
        if (targetClubId) {
          playerAppearances = playerAppearances.filter(
            (a: Record<string, unknown>) => a.clubId === targetClubId
          );
        }

        allAppearances = allAppearances.concat(playerAppearances as CometAppearance[]);

        if (page >= (data.lastPage || 0)) break;
        page++;
      } while (true);
    }

    // 2. Загружаем события (Match Events)
    const eventsMap: Record<number, { goals: number; yellowCards: number; redCards: number }> = {};

    if (EVENTS_API_KEY) {
      let page = 0;
      const pageSize = 500;

      do {
        const url = `${COMET_BASE_URL}/data-backend/api/public/areports/run/${page}/${pageSize}/?API_KEY=${EVENTS_API_KEY}`;

        const response = await fetch(url, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });

        if (!response.ok) break;

        const data = await response.json();

        if (!data.results || data.results.length === 0) break;

        let playerEvents = data.results.filter(
          (e: Record<string, unknown>) => e.personId?.toString() === player.cometId
        );

        // Фильтруем по клубу
        if (targetClubId) {
          playerEvents = playerEvents.filter(
            (e: Record<string, unknown>) => e.teamId === targetClubId
          );
        }

        for (const event of playerEvents as CometEvent[]) {
          if (!eventsMap[event.matchId]) {
            eventsMap[event.matchId] = { goals: 0, yellowCards: 0, redCards: 0 };
          }

          switch (event.matchEventType) {
            case 'Гол':
              eventsMap[event.matchId].goals++;
              break;
            case 'Жёлтая карточка':
              eventsMap[event.matchId].yellowCards++;
              break;
            case 'Красная карточка':
              eventsMap[event.matchId].redCards++;
              break;
          }
        }

        if (page >= (data.lastPage || 0)) break;
        page++;
      } while (true);
    }

    // 3. Объединяем данные
    const mergedAppearances = allAppearances.map((a) => {
      const events = eventsMap[a.matchId] || { goals: 0, yellowCards: 0, redCards: 0 };
      return {
        date: a.date,
        match: a.matchDescription || '',
        competition: a.competitionType || 'Другое',
        round: a.round || '',
        shirtNumber: a.shirtNumber || 0,
        startingLineup: a.startingLineup === 1,
        played: a.played === 1,
        goals: events.goals || a.goals || 0,
        yellowCards: events.yellowCards || a.singleYellow || 0,
        redCards: events.redCards || a.redCards || 0,
        minutesPlayed: a.minutesPlayed || 0,
        result: a.result || '',
        goalkeeper: a.goalkeeper || 0,
      };
    });

    mergedAppearances.sort((a, b) => b.date - a.date);

    // Статистика вратарей
    const goalkeeperAppearances = mergedAppearances.filter((a) => a.goalkeeper === 1);
    const cleanSheets = goalkeeperAppearances.filter((a) => {
      const desc = a.match || '';
      const scoreMatch = desc.match(/(\d+)\s*:\s*(\d+)/);
      if (!scoreMatch) return false;
      const ourScore = desc.includes('Динамо-Брест')
        ? parseInt(scoreMatch[1])
        : parseInt(scoreMatch[2]);
      const theirScore = desc.includes('Динамо-Брест')
        ? parseInt(scoreMatch[2])
        : parseInt(scoreMatch[1]);
      return ourScore > 0 && theirScore === 0;
    }).length;

    const totals = {
      appearances: mergedAppearances.length,
      goals: mergedAppearances.reduce((sum, a) => sum + a.goals, 0),
      yellowCards: mergedAppearances.reduce((sum, a) => sum + a.yellowCards, 0),
      redCards: mergedAppearances.reduce((sum, a) => sum + a.redCards, 0),
      minutesPlayed: mergedAppearances.reduce((sum, a) => sum + a.minutesPlayed, 0),
      startedMatches: mergedAppearances.filter((a) => a.startingLineup).length,
      subAppearances: mergedAppearances.filter((a) => !a.startingLineup).length,
      cleanSheets,
      goalsConceded: mergedAppearances.reduce((sum, a) => {
        const desc = a.match || '';
        const scoreMatch = desc.match(/(\d+)\s*:\s*(\d+)/);
        if (!scoreMatch) return sum;
        const theirScore = desc.includes('Динамо-Брест')
          ? parseInt(scoreMatch[2])
          : parseInt(scoreMatch[1]);
        return sum + (isNaN(theirScore) ? 0 : theirScore);
      }, 0),
      assists: 0,
    };

    const byCompetition: Record<string, typeof totals> = {};
    for (const a of mergedAppearances) {
      const comp = a.competition || 'Другое';
      if (!byCompetition[comp]) {
        byCompetition[comp] = {
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
      byCompetition[comp].appearances++;
      byCompetition[comp].goals += a.goals;
      byCompetition[comp].yellowCards += a.yellowCards;
      byCompetition[comp].redCards += a.redCards;
      byCompetition[comp].minutesPlayed += a.minutesPlayed;
      if (a.startingLineup) byCompetition[comp].startedMatches++;
      else byCompetition[comp].subAppearances++;
    }

    return NextResponse.json({
      success: true,
      player: { id: player.cometId, name: `${player.lastName} ${player.firstName}` },
      totals,
      byCompetition,
      appearances: mergedAppearances,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    console.error('Player stats error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
