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
    const { type, teamId, competitionId, cometTeamId, cometCompetitionId } = await request.json();

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
        for (const p of players) {
          // Ищем существующего игрока по cometId
          const existing = await prisma.player.findFirst({
            where: { cometId: p.id },
          });

          if (existing) {
            await prisma.player.update({
              where: { id: existing.id },
              data: {
                firstName: p.firstName,
                lastName: p.lastName,
                middleName: p.middleName || null,
                shortName: p.shortName || null,
                number: p.shirtNumber || null,
                position: p.position?.name || null,
                birthDate: p.birthDate ? new Date(p.birthDate) : null,
                nationality: p.nationality?.name || null,
                height: p.height || null,
                weight: p.weight || null,
                photoUrl: p.photoUrl || null,
                isActive: p.active,
              },
            });
          } else {
            await prisma.player.create({
              data: {
                cometId: p.id,
                teamId: teamId,
                firstName: p.firstName,
                lastName: p.lastName,
                middleName: p.middleName || null,
                shortName: p.shortName || null,
                number: p.shirtNumber || null,
                position: p.position?.name || null,
                birthDate: p.birthDate ? new Date(p.birthDate) : null,
                nationality: p.nationality?.name || null,
                height: p.height || null,
                weight: p.weight || null,
                photoUrl: p.photoUrl || null,
                isActive: p.active,
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
        for (const m of matches) {
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
                teamId: teamId,
                homeTeam: m.homeTeam.name,
                awayTeam: m.awayTeam.name,
                homeLogoUrl: m.homeTeam.logoUrl || null,
                awayLogoUrl: m.awayTeam.logoUrl || null,
                homeScore: m.homeScore,
                awayScore: m.awayScore,
                matchDate: new Date(m.matchDate),
                stadium: m.stadium?.name || null,
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
        // Удаляем старую таблицу и вставляем новую
        await prisma.standings.deleteMany({
          where: { tournamentId: cometCompetitionId },
        });
        for (const row of standings) {
          await prisma.standings.create({
            data: {
              tournamentId: cometCompetitionId,
              teamName: row.team.name,
              teamLogoUrl: row.team.logoUrl || null,
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
function mapStatus(apiStatus: string): string {
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
