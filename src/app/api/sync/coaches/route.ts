// src/app/api/sync/coaches/route.ts - Синхронизация тренеров и персонала из COMET
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSetting } from '@/lib/settings';

interface CometPerson {
  personId: number;
  firstName: string;
  lastName: string;
  registrationType: string;
  registrationCategory: string;
  titleCoach: string;
  titlePlayer: string;
  titleReferee: string;
  orgName: string;
  registrationStatus: string;
  photo: string;
  dateOfBirth: number;
  nationality: string;
}

interface SyncSource {
  key: string;
  type: 'coach' | 'staff';
  settingKey: string;
}

const COMET_BASE_URL = process.env.COMET_API_BASE_URL || 'https://comet.abff.by';

async function fetchAllPages(apiKey: string): Promise<CometPerson[]> {
  let allResults: CometPerson[] = [];
  let page = 0;
  const pageSize = 500;

  do {
    const url = `${COMET_BASE_URL}/data-backend/api/public/areports/run/${page}/${pageSize}/?API_KEY=${apiKey}`;
    console.log(`📡 Загрузка страницы ${page} (${apiKey.slice(-8)}...)`);

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
      (c: CometPerson) => c.orgName === 'Динамо-Брест' && c.registrationStatus === 'Подтверждено'
    );

    allResults = allResults.concat(filtered);
    console.log(`📄 Стр. ${page}: +${filtered.length} записей (всего ${allResults.length})`);

    if (page >= (data.lastPage || 0)) break;
    page++;
  } while (true);

  return allResults;
}

export async function POST(request: NextRequest) {
  try {
    const dbCoachesKey = await getSetting('COMET_API_KEY_COACHES');
    const envCoachesKey = process.env.COMET_API_KEY_COACHES || '';
    const coachesKey = dbCoachesKey || envCoachesKey;

    const dbStaffKey = await getSetting('COMET_API_KEY_STAFF');
    const envStaffKey = process.env.COMET_API_KEY_STAFF || '';
    const staffKey = dbStaffKey || envStaffKey;

    const SYNC_SOURCES: SyncSource[] = [
      { key: coachesKey, type: 'coach', settingKey: 'COMET_API_KEY_COACHES' },
      { key: staffKey, type: 'staff', settingKey: 'COMET_API_KEY_STAFF' },
    ];

    console.log('🔄 Синхронизация тренеров и персонала из COMET...');

    let totalCreated = 0;
    let totalUpdated = 0;
    const allCometIds: string[] = [];

    for (const source of SYNC_SOURCES) {
      if (!source.key) {
        console.log(`⚠️ Пропуск ${source.type}: ключ не настроен`);
        continue;
      }

      const label = source.type === 'coach' ? 'Тренеры' : 'Персонал';
      console.log(`\n📥 Загружаем: ${label}`);

      const persons = await fetchAllPages(source.key);
      console.log(`📥 ${label}: загружено ${persons.length} записей`);

      let created = 0;
      let updated = 0;

      for (const c of persons) {
        try {
          const cometId = c.personId?.toString() || '';
          if (!cometId) continue;

          const nameParts = ((c.firstName as string) || '').trim().split(/\s+/);
          const firstName = nameParts[0] || '';
          const middleName = nameParts.slice(1).join(' ') || null;
          const birthDate = c.dateOfBirth ? new Date(c.dateOfBirth as number) : null;
          const photoUrl = (c.photo as string) || null;
          const position =
            (c.registrationType as string) ||
            (c.titleCoach as string) ||
            (c.titlePlayer as string) ||
            '';

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
            type: source.type,
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

          allCometIds.push(cometId);
        } catch (err) {
          console.error(`Ошибка обработки (${source.type}):`, c.personId, err);
        }
      }

      console.log(`✅ ${label}: создано ${created}, обновлено ${updated}`);
      totalCreated += created;
      totalUpdated += updated;
    }

    const uniqueCometIds = [...new Set(allCometIds)];
    const deactivated = await prisma.coach.updateMany({
      where: {
        cometId: { notIn: uniqueCometIds },
        isManuallyCreated: false,
        isActive: true,
      },
      data: { isActive: false },
    });

    console.log(
      `\n🏁 Итого: создано ${totalCreated}, обновлено ${totalUpdated}, деактивировано ${deactivated.count}`
    );

    return NextResponse.json({
      success: true,
      created: totalCreated,
      updated: totalUpdated,
      deactivated: deactivated.count,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    console.error('❌ Ошибка синхронизации:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
