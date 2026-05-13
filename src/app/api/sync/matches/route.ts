// src/app/api/sync/matches/route.ts - Синхронизация матчей, клубов и стадионов с COMET API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const COMET_API_KEY_MATCHES = process.env.COMET_API_KEY_MATCHES || '';
const COMET_API_KEY_FACILITIES = process.env.COMET_API_KEY_FACILITIES || '';
const COMET_BASE_URL = process.env.COMET_API_BASE_URL || 'https://comet.abff.by';

const OUR_TEAM_IDS = [68812, 102734, 101132];

const OUR_CLUB_NAMES: Record<number, string> = {
  68812: 'Динамо-Брест',
  102734: 'Динамо-Брест (дубль)',
  101132: 'Динамо-Брест (жен)',
};

const OUR_CLUB_SHORT_NAMES: Record<number, string> = {
  68812: 'Динамо-Брест',
  102734: 'Динамо-Брест-2',
  101132: 'Динамо-Брест-Ж',
};

async function fetchCometPage(
  apiKey: string,
  page: number,
  pageSize: number = 500
): Promise<Record<string, unknown>[]> {
  const url = `${COMET_BASE_URL}/data-backend/api/public/areports/run/${page}/${pageSize}/?API_KEY=${apiKey}`;
  const response = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  if (!response.ok) {
    console.error(`❌ page ${page}: HTTP ${response.status}`);
    return [];
  }
  const data = (await response.json()) as { results?: Record<string, unknown>[] };
  return data.results || [];
}

function getMatchType(
  match: Record<string, unknown>,
  ourTeamId: number
): 'osnova' | 'dubl' | 'women' {
  if (ourTeamId === 101132) return 'women';
  if (ourTeamId === 102734) return 'dubl';
  return 'osnova';
}

function cleanTeamName(rawName: string): string {
  return rawName
    .replace(/\d+\s*:\s*\d+/, '')
    .replace(/\d+\s*-\s*\d+/, '')
    .replace(/-:-/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[""]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function ensureOurTeams() {
  for (const id of OUR_TEAM_IDS) {
    const existing = await prisma.opponentTeam.findUnique({ where: { cometId: id } });

    if (!existing) {
      await prisma.opponentTeam.create({
        data: {
          cometId: id,
          name: OUR_CLUB_NAMES[id] || `Динамо-Брест #${id}`,
          shortName: OUR_CLUB_SHORT_NAMES[id] || `ДБ-${id}`,
          city: 'Брест',
          country: 'Беларусь',
          isActive: true,
        },
      });
    }
  }
}

async function syncAll() {
  const logs: string[] = [];

  // 0. Проверка наших клубов
  logs.push('🏠 Проверка наших клубов...');
  await ensureOurTeams();
  logs.push('✅ Наши клубы проверены');

  // 1. Стадионы
  logs.push('🏟️ Стадионы...');
  let page = 0;
  let totalFacilities = 0;
  const facilityIds = new Set<number>();

  while (true) {
    const facilities = await fetchCometPage(COMET_API_KEY_FACILITIES, page);
    if (facilities.length === 0) break;

    for (const f of facilities) {
      const facilityId = f['facilityId'] ? parseInt(f['facilityId'] as string) : 0;
      const facilityName = (f['facilityName'] as string) || (f['facilityLongName'] as string) || '';
      const facilityAddress = (f['facilityAddress'] as string) || '';

      if (!facilityId || !facilityName) continue;
      if (facilityIds.has(facilityId)) continue;
      facilityIds.add(facilityId);

      await prisma.facility.upsert({
        where: { cometId: facilityId },
        update: {
          name: facilityName,
          shortName: facilityName,
          address: facilityAddress || null,
          city: (f['facilityPlace'] as string) || null,
          region: (f['facilityRegion'] as string) || null,
          country: (f['facilityCountry'] as string) || null,
          lat: (f['Latitude'] as number) || null,
          lng: (f['Longitude'] as number) || null,
        },
        create: {
          cometId: facilityId,
          name: facilityName,
          shortName: facilityName,
          address: facilityAddress || null,
          city: (f['facilityPlace'] as string) || null,
          region: (f['facilityRegion'] as string) || null,
          country: (f['facilityCountry'] as string) || null,
          lat: (f['Latitude'] as number) || null,
          lng: (f['Longitude'] as number) || null,
        },
      });
      totalFacilities++;
    }
    page++;
    if (facilities.length < 500) break;
  }
  logs.push(`✅ Стадионов: ${totalFacilities}`);

  // 2. Сбор клубов соперников
  logs.push('👥 Сбор клубов...');
  page = 0;
  const opponentIds = new Set<number>();
  while (true) {
    const matches = await fetchCometPage(COMET_API_KEY_MATCHES, page);
    if (matches.length === 0) break;
    for (const m of matches) {
      const homeTeamId = m.homeTeam as number;
      const awayTeamId = m.awayTeam as number;
      if (OUR_TEAM_IDS.includes(homeTeamId) && !OUR_TEAM_IDS.includes(awayTeamId))
        opponentIds.add(awayTeamId);
      if (OUR_TEAM_IDS.includes(awayTeamId) && !OUR_TEAM_IDS.includes(homeTeamId))
        opponentIds.add(homeTeamId);
    }
    page++;
    if (matches.length < 500) break;
  }

  let totalOpponents = 0;
  for (const id of opponentIds) {
    const exists = await prisma.opponentTeam.findUnique({ where: { cometId: id } });
    if (!exists) {
      await prisma.opponentTeam.create({
        data: { cometId: id, name: `Клуб #${id}`, shortName: `#${id}` },
      });
      totalOpponents++;
    }
  }
  logs.push(`👥 Клубов: ${opponentIds.size} (новых: ${totalOpponents})`);

  // 3. Матчи
  logs.push('⚽ Матчи...');
  page = 0;
  let totalMatches = 0,
    created = 0,
    updated = 0;
  const ourTeamSlugs: Record<string, string> = {
    osnova: 'osnovnoy-sostav',
    dubl: 'dubliruyushchiy-sostav',
    women: 'zhenskaya-komanda',
  };
  const TBD_DATE = new Date('1970-01-01T00:00:00.000Z');

  while (true) {
    const matches = await fetchCometPage(COMET_API_KEY_MATCHES, page);
    if (matches.length === 0) break;
    for (const m of matches) {
      const homeTeamId = m.homeTeam as number;
      const awayTeamId = m.awayTeam as number;
      const isOurHome = OUR_TEAM_IDS.includes(homeTeamId);
      const isOurAway = OUR_TEAM_IDS.includes(awayTeamId);
      if (!isOurHome && !isOurAway) continue;

      let homeScore: number | null = null;
      let awayScore: number | null = null;
      const desc = (m.matchDescription as string) || '';

      const scoreMatch = desc.match(/(\d+)\s*:\s*(\d+)/);
      if (scoreMatch) {
        homeScore = parseInt(scoreMatch[1]);
        awayScore = parseInt(scoreMatch[2]);
      }

      const parts = desc
        .split(' - ')
        .map((s) => s.trim())
        .filter(Boolean);
      let homeTeamName = parts[0] || `Команда ${homeTeamId}`;
      let awayTeamName = parts[1] || `Команда ${awayTeamId}`;

      homeTeamName = cleanTeamName(homeTeamName);
      awayTeamName = cleanTeamName(awayTeamName);

      const rawDate = (m.matchDate as number) || 0;
      const matchDate = rawDate > 946684800000 ? new Date(rawDate) : TBD_DATE;

      const ourTeamId = isOurHome ? homeTeamId : awayTeamId;
      const matchType = getMatchType(m, ourTeamId);
      const status = (m.matchStatus as string) === 'СЫГРАНО' ? 'finished' : 'scheduled';
      const slug = ourTeamSlugs[matchType];
      const ourTeam = await prisma.team.findUnique({ where: { slug } });

      const facilityIdFromMatch = m.facilityId
        ? parseInt(m.facilityId as string) || (m.facilityId as number)
        : null;

      const matchData = {
        matchDate,
        homeTeam: homeTeamName,
        awayTeam: awayTeamName,
        homeScore,
        awayScore,
        homeTeamId: homeTeamId,
        awayTeamId: awayTeamId,
        stadium: (m.facility as string) || null,
        facilityId: facilityIdFromMatch ? facilityIdFromMatch : null,
        tournament: (m.name as string) || null,
        round: m.round ? String(m.round) : null,
        status,
        matchType,
        gender: (m.gender as string) || null,
        attendance: (m.attendance as number) || null,
        isHome: isOurHome,
        teamId: ourTeam?.id || '',
      };

      const cometId = m.matchId ? String(m.matchId) : null;
      const existing = cometId ? await prisma.match.findFirst({ where: { cometId } }) : null;

      if (existing) {
        try {
          await prisma.match.update({ where: { id: existing.id }, data: matchData });
          updated++;
        } catch (err) {
          console.warn(`⚠️ Ошибка обновления матча ${existing.id}, пробуем без facilityId`);
          await prisma.match.update({
            where: { id: existing.id },
            data: { ...matchData, facilityId: null },
          });
          updated++;
        }
      } else {
        try {
          await prisma.match.create({ data: { ...matchData, cometId } });
          created++;
        } catch (err) {
          console.warn(`⚠️ Ошибка создания матча, пробуем без facilityId`);
          await prisma.match.create({ data: { ...matchData, cometId, facilityId: null } });
          created++;
        }
      }
      totalMatches++;
    }
    page++;
    if (matches.length < 500) break;
  }
  logs.push(`⚽ Матчей: ${totalMatches} (создано: ${created}, обновлено: ${updated})`);

  // 4. Обновляем названия клубов
  for (const id of opponentIds) {
    const team = await prisma.opponentTeam.findUnique({ where: { cometId: id } });
    if (team && team.name.startsWith('Клуб #')) {
      const match = await prisma.match.findFirst({
        where: { OR: [{ homeTeamId: id }, { awayTeamId: id }] },
        orderBy: { matchDate: 'desc' },
      });
      if (match) {
        const name = match.homeTeamId === id ? match.homeTeam : match.awayTeam;
        const cleanedName = cleanTeamName(name);
        if (cleanedName) {
          await prisma.opponentTeam.update({
            where: { cometId: id },
            data: { name: cleanedName, shortName: cleanedName },
          });
        }
      }
    }
  }
  logs.push('✅ Названия клубов обновлены');
  return logs;
}

export async function GET() {
  try {
    const logs = await syncAll();
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const logs = await syncAll();
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
