// src/app/api/cron/sync-players/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transliterate } from '@/lib/utils';

const COMET_API_KEY = process.env.COMET_API_KEY_PLAYERS || '';
const COMET_BASE_URL = process.env.COMET_API_BASE_URL || 'https://comet.abff.by';
const CRON_SECRET = process.env.CRON_SECRET || '';

interface CometPlayerData {
  personId: number;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: number;
  nationality: string;
  level: string;
  titlePlayer: string;
  height: string;
  weight: string;
  photo: string;
  orgName: string;
  registrationStatus: string;
}

interface CometResponse {
  results: CometPlayerData[];
  totalSize: number;
  page: number;
  pageSize: number;
  lastPage: number;
}

async function generateUniqueSlug(firstName: string, lastName: string): Promise<string> {
  let slug = transliterate(`${firstName}-${lastName}`);
  slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!slug) slug = `player-${Date.now().toString().slice(-6)}`;

  const existing = await prisma.player.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-6)}`;
  }
  return slug;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  const urlToken = request.nextUrl.searchParams.get('token') || '';

  if (token !== CRON_SECRET && urlToken !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('🔄 [CRON] Запуск автоматической синхронизации игроков...');
  const startTime = Date.now();

  try {
    let allPlayers: CometPlayerData[] = [];
    let page = 0;
    const pageSize = 25;

    do {
      const url = `${COMET_BASE_URL}/data-backend/api/public/areports/run/0/${pageSize}/?page=${page}&API_KEY=${COMET_API_KEY}`;

      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error(`[CRON] ❌ Ошибка стр. ${page}: ${response.status}`);
        break;
      }

      const data: CometResponse = await response.json();
      if (!data.results || data.results.length === 0) break;

      const filtered = data.results.filter(
        (p) => p.orgName === 'Динамо-Брест' && p.registrationStatus === 'Подтверждено'
      );

      allPlayers = allPlayers.concat(filtered);

      if (page >= data.lastPage) break;
      page++;
    } while (true);

    let created = 0;
    let updated = 0;
    let deactivated = 0;

    const cometIds = allPlayers.map((p) => p.personId.toString());

    const deactivatedResult = await prisma.player.updateMany({
      where: {
        cometId: { notIn: cometIds },
        isManuallyCreated: false,
        isActive: true,
      },
      data: { isActive: false },
    });
    deactivated = deactivatedResult.count;

    const positionMap: Record<string, string> = {
      GOALKEEPER: 'Вратарь',
      DEFENDER: 'Защитник',
      MIDFIELDER: 'Полузащитник',
      FORWARD: 'Нападающий',
    };

    for (const p of allPlayers) {
      try {
        const cometId = p.personId.toString();
        if (!cometId) continue;

        const nameParts = (p.firstName || '').trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const middleName = nameParts.slice(1).join(' ') || null;
        const lastName = p.lastName || '';

        const updateData = {
          firstName,
          lastName,
          middleName,
          birthDate: p.dateOfBirth ? new Date(p.dateOfBirth) : null,
          nationality: p.nationality || null,
          position: positionMap[p.titlePlayer] || p.titlePlayer || null,
          level: (p.level || '').toLowerCase().includes('профессионал')
            ? 'professional'
            : (p.level || '').toLowerCase().includes('любитель')
              ? 'amateur'
              : null,
          gender: (p.gender || '').toLowerCase().includes('муж')
            ? 'male'
            : (p.gender || '').toLowerCase().includes('жен')
              ? 'female'
              : null,
          isActive: true,
        };

        const existing = await prisma.player.findFirst({ where: { cometId } });

        if (existing) {
          await prisma.player.update({ where: { id: existing.id }, data: updateData });
          updated++;
        } else {
          const slug = await generateUniqueSlug(firstName, lastName);
          await prisma.player.create({
            data: {
              ...updateData,
              cometId,
              slug,
              height: p.height ? parseInt(p.height, 10) || null : null,
              weight: p.weight ? parseInt(p.weight, 10) || null : null,
              photoUrl: p.photo || null,
              isManuallyCreated: false,
              isPublished: false,
            },
          });
          created++;
        }
      } catch {
        // skip individual errors
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `[CRON] ✅ Готово: создано ${created}, обновлено ${updated}, деактивировано ${deactivated} за ${duration}с`
    );

    return NextResponse.json({
      success: true,
      created,
      updated,
      deactivated,
      total: allPlayers.length,
      durationSeconds: duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    console.error('[CRON] ❌ Ошибка:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
