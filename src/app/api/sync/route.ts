// src/app/api/sync/route.ts - Ручной запуск синхронизации
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  fetchTeamPlayers,
  fetchTeamMatches,
  fetchCompetitionStandings,
} from '@/modules/team/services/cometApi';

export async function POST(request: NextRequest) {
  try {
    const { type, teamId, cometTeamId, cometCompetitionId } = await request.json();

    if (!teamId) {
      return NextResponse.json({ error: 'Не указан teamId' }, { status: 400 });
    }

    let result;

    switch (type) {
      case 'players':
        if (!cometTeamId) {
          return NextResponse.json({ error: 'Не указан cometTeamId' }, { status: 400 });
        }
        const players = await fetchTeamPlayers(cometTeamId);
        console.log(`Получено ${players.length} игроков из API`);

        for (const p of players) {
          // Нормализуем данные (API может возвращать объекты вместо строк)
          const firstName = typeof p.firstName === 'string' ? p.firstName : '';
          const lastName = typeof p.lastName === 'string' ? p.lastName : '';
          const nationality =
            typeof p.nationality === 'object' && p.nationality?.name
              ? p.nationality.name
              : typeof p.nationality === 'string'
                ? p.nationality
                : null;
          const position =
            typeof p.position === 'object' && p.position?.name
              ? p.position.name
              : typeof p.position === 'string'
                ? p.position
                : null;

          const existing = await prisma.player.findFirst({
            where: { cometId: p.id },
          });

          if (existing) {
            await prisma.player.update({
              where: { id: existing.id },
              data: {
                firstName,
                lastName,
                middleName: p.middleName || null,
                shortName: p.shortName || null,
                number: p.shirtNumber || (p as { jerseyNumber?: number }).jerseyNumber || null,
                position,
                birthDate: p.birthDate ? new Date(p.birthDate) : null,
                nationality,
                height: p.height || null,
                weight: p.weight || null,
                photoUrl: p.photoUrl || null,
                isActive: p.active !== false,
              },
            });
          } else {
            await prisma.player.create({
              data: {
                cometId: p.id,
                teamId,
                firstName,
                lastName,
                middleName: p.middleName || null,
                shortName: p.shortName || null,
                number: p.shirtNumber || (p as { jerseyNumber?: number }).jerseyNumber || null,
                position,
                birthDate: p.birthDate ? new Date(p.birthDate) : null,
                nationality,
                height: p.height || null,
                weight: p.weight || null,
                photoUrl: p.photoUrl || null,
                isActive: p.active !== false,
              },
            });
          }
        }
        result = { message: `Синхронизировано ${players.length} игроков` };
        break;

      case 'matches':
        if (!cometTeamId) {
          return NextResponse.json({ error: 'Не указан cometTeamId' }, { status: 400 });
        }
        const matches = await fetchTeamMatches(cometTeamId, cometCompetitionId);
        console.log(`Получено ${matches.length} матчей из API`);

        for (const m of matches) {
          // Нормализуем данные
          const stadium =
            typeof m.stadium === 'object' && m.stadium?.name
              ? m.stadium.name
              : typeof m.stadium === 'string'
                ? m.stadium
                : null;

          const existing = await prisma.match.findFirst({
            where: { cometId: m.id },
          });

          if (existing) {
            await prisma.match.update({
              where: { id: existing.id },
              data: {
                homeScore: m.homeScore,
                awayScore: m.awayScore,
                status: mapStatus(m.status),
              },
            });
          } else {
            await prisma.match.create({
              data: {
                cometId: m.id,
                teamId,
                homeTeam: m.homeTeam?.name || 'Неизвестно',
                awayTeam: m.awayTeam?.name || 'Неизвестно',
                homeLogoUrl: m.homeTeam?.logoUrl || null,
                awayLogoUrl: m.awayTeam?.logoUrl || null,
                homeScore: m.homeScore,
                awayScore: m.awayScore,
                matchDate: new Date(m.matchDate),
                stadium,
                tournament: m.competition?.name || null,
                tournamentId: m.competition?.id || null,
                round: m.round || null,
                status: mapStatus(m.status),
              },
            });
          }
        }
        result = { message: `Синхронизировано ${matches.length} матчей` };
        break;

      case 'standings':
        if (!cometCompetitionId) {
          return NextResponse.json({ error: 'Не указан cometCompetitionId' }, { status: 400 });
        }
        const standings = await fetchCompetitionStandings(cometCompetitionId);
        console.log(`Получено ${standings.length} записей турнирной таблицы`);

        // Удаляем старую таблицу и вставляем новую
        await prisma.standings.deleteMany({
          where: { tournamentId: cometCompetitionId },
        });
        for (const row of standings) {
          await prisma.standings.create({
            data: {
              tournamentId: cometCompetitionId,
              teamName: row.team?.name || 'Неизвестно',
              teamLogoUrl: row.team?.logoUrl || null,
              position: row.position,
              played: row.played,
              won: row.won,
              drawn: row.drawn,
              lost: row.lost,
              goalsFor: row.goalsFor,
              goalsAgainst: row.goalsAgainst,
              points: row.points,
            },
          });
        }
        result = { message: `Синхронизирована турнирная таблица (${standings.length} записей)` };
        break;

      default:
        return NextResponse.json({ error: 'Неизвестный тип синхронизации' }, { status: 400 });
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Преобразование статуса матча
function mapStatus(apiStatus?: string): string {
  switch (apiStatus?.toUpperCase()) {
    case 'SCHEDULED':
      return 'scheduled';
    case 'LIVE':
      return 'live';
    case 'FINISHED':
      return 'finished';
    case 'POSTPONED':
    case 'CANCELLED':
      return 'postponed';
    default:
      return 'scheduled';
  }
}
