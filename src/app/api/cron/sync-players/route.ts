// src/app/api/cron/sync-players/route.ts - Автоматическая синхронизация игроков по Cron
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

export async function GET(request: NextRequest) {
  // Проверка секретного ключа
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

    // 1. Собираем все страницы
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

    console.log(`[CRON] 📥 Всего игроков: ${allPlayers.length}`);

    let created = 0;
    let updated = 0;
    let deactivated = 0;

    // 2. Собираем все cometId из COMET для деактивации ушедших
    const cometIds = allPlayers.map((p) => p.personId.toString());

    // 3. Деактивируем игроков, которых больше нет в COMET
    const deactivatedResult = await prisma.player.updateMany({
      where: {
        cometId: { notIn: cometIds },
        isManuallyCreated: false,
        isActive: true,
      },
      data: { isActive: false },
    });
    deactivated = deactivatedResult.count;

    // 4. Upsert игроков
    for (const p of allPlayers) {
      try {
        const cometId = p.personId.toString();
        if (!cometId) continue;

        const nameParts = (p.firstName || '').trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const middleName = nameParts.slice(1).join(' ') || null;
        const lastName = p.lastName || '';
        const birthDate = p.dateOfBirth ? new Date(p.dateOfBirth) : null;
        const nationality = p.nationality || null;

        const positionMap: Record<string, string> = {
          GOALKEEPER: 'Вратарь',
          DEFENDER: 'Защитник',
          MIDFIELDER: 'Полузащитник',
          FORWARD: 'Нападающий',
        };
        const position = positionMap[p.titlePlayer] || p.titlePlayer || null;

        const levelRaw = (p.level || '').toLowerCase();
        const level = levelRaw.includes('профессионал')
          ? 'professional'
          : levelRaw.includes('любитель')
            ? 'amateur'
            : null;

        const genderRaw = (p.gender || '').toLowerCase();
        const gender = genderRaw.includes('муж')
          ? 'male'
          : genderRaw.includes('жен')
            ? 'female'
            : null;

        const height = p.height ? parseInt(p.height, 10) || null : null;
        const weight = p.weight ? parseInt(p.weight, 10) || null : null;
        const photoUrl = p.photo || null;

        const existing = await prisma.player.findFirst({ where: { cometId } });

        if (existing) {
          await prisma.player.update({
            where: { id: existing.id },
            data: {
              firstName,
              lastName,
              middleName,
              birthDate,
              nationality,
              position,
              level,
              gender,
              isActive: true,
            },
          });
          updated++;
        } else {
          await prisma.player.create({
            data: {
              cometId,
              firstName,
              lastName,
              middleName,
              birthDate,
              nationality,
              position,
              level,
              gender,
              height,
              weight,
              photoUrl,
              isActive: true,
              isManuallyCreated: false,
              isPublished: true,
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
