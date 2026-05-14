// src/app/api/sync/coaches/route.ts - Синхронизация тренеров из COMET
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const COMET_API_KEY =
      process.env.COMET_API_KEY_COACHES ||
      '0006QUJGRgb3b70a6a8ab4b8979a99aeef62d3ea0484c97b0503203c17a305361526bf3ace26162dd3c3c9e8d72abc01a16f6d19dbc498ce52924ca4cfaef7c4';
    const COMET_BASE_URL = process.env.COMET_API_BASE_URL || 'https://comet.abff.by';

    console.log('🔄 Синхронизация тренеров из COMET...');

    let allCoaches: Record<string, unknown>[] = [];
    let page = 0;
    const pageSize = 500;

    do {
      const url = `${COMET_BASE_URL}/data-backend/api/public/areports/run/${page}/${pageSize}/?API_KEY=${COMET_API_KEY}`;
      console.log(`📡 Загрузка страницы ${page}...`);

      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error(`❌ Ошибка стр. ${page}: ${response.status}`);
        break;
      }

      const data = await response.json();

      if (!data.results || data.results.length === 0) break;

      const filtered = data.results.filter(
        (c: Record<string, unknown>) =>
          c.orgName === 'Динамо-Брест' && c.registrationStatus === 'Подтверждено'
      );

      allCoaches = allCoaches.concat(filtered);
      console.log(`📄 Стр. ${page}: +${filtered.length} тренеров (всего ${allCoaches.length})`);

      if (page >= (data.lastPage || 0)) break;
      page++;
    } while (true);

    console.log(`📥 Всего тренеров после фильтра: ${allCoaches.length}`);

    let created = 0;
    let updated = 0;

    for (const c of allCoaches) {
      try {
        const cometId = (c.personId as number)?.toString() || '';
        if (!cometId) continue;

        const nameParts = ((c.firstName as string) || '').trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const middleName = nameParts.slice(1).join(' ') || null;
        const birthDate = c.dateOfBirth ? new Date(c.dateOfBirth as number) : null;
        const photoUrl = (c.photo as string) || null;
        const position = (c.registrationType as string) || (c.titleCoach as string) || 'Тренер';

        const existing = await prisma.coach.findFirst({ where: { cometId } });

        const updateData = {
          firstName,
          lastName: (c.lastName as string) || '',
          middleName,
          birthDate,
          nationality: (c.nationality as string) || null,
          position,
          photoUrl,
          isActive: true,
        };

        if (existing) {
          await prisma.coach.update({ where: { id: existing.id }, data: updateData });
          updated++;
        } else {
          await prisma.coach.create({
            data: {
              ...updateData,
              cometId,
              isManuallyCreated: false,
              isPublished: true,
            },
          });
          created++;
        }
      } catch (err) {
        console.error('Ошибка обработки тренера:', c.personId, err);
      }
    }

    console.log(`✅ Создано: ${created}, обновлено: ${updated}`);

    // Деактивируем тренеров, которых больше нет в COMET
    const activeCometIds = allCoaches
      .map((c) => (c.personId as number)?.toString())
      .filter(Boolean);
    const deactivated = await prisma.coach.updateMany({
      where: {
        cometId: { notIn: activeCometIds },
        isManuallyCreated: false,
        isActive: true,
      },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      created,
      updated,
      deactivated: deactivated.count,
      total: allCoaches.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    console.error('❌ Ошибка синхронизации:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
