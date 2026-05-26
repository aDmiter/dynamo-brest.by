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
  orgName: string;
  registrationStatus: string;
  photo: string;
  dateOfBirth: number;
  nationality: string;
}

function trimStr(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v.trim();
  return String(v).trim();
}

function positionForNewRecordFromComet(c: CometPerson): string {
  return (
    trimStr(c.registrationType) ||
    trimStr(c.registrationCategory) ||
    trimStr(c.titleCoach) ||
    trimStr(c.titlePlayer) ||
    ''
  );
}

const COMET_BASE_URL = process.env.COMET_API_BASE_URL || 'https://comet.abff.by';

async function fetchAllPages(apiKey: string): Promise<CometPerson[]> {
  let allResults: CometPerson[] = [];
  let page = 0;
  const pageSize = 500;

  do {
    const url = `${COMET_BASE_URL}/data-backend/api/public/areports/run/${page}/${pageSize}/?API_KEY=${apiKey}`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) break;

    const data = await response.json();
    if (!data.results || data.results.length === 0) break;

    const filtered = data.results.filter(
      (c: CometPerson) => c.orgName === 'Динамо-Брест' && c.registrationStatus === 'Подтверждено'
    );

    allResults = allResults.concat(filtered);
    if (page >= (data.lastPage || 0)) break;
    page++;
  } while (true);

  return allResults;
}

export type CometCoachesSyncResult = {
  success: true;
  created: number;
  updated: number;
  deactivated: number;
};

export async function syncCoachesFromComet(): Promise<
  CometCoachesSyncResult | { success: false; error: string }
> {
  const coachesKey =
    (await getSetting('COMET_API_KEY_COACHES')) || process.env.COMET_API_KEY_COACHES || '';
  const staffKey = (await getSetting('COMET_API_KEY_STAFF')) || process.env.COMET_API_KEY_STAFF || '';

  const sources: Array<{ key: string; type: 'coach' | 'staff' }> = [
    { key: coachesKey, type: 'coach' },
    { key: staffKey, type: 'staff' },
  ];

  if (!coachesKey && !staffKey) {
    return { success: false, error: 'Ключи COMET для тренеров и персонала не настроены' };
  }

  let totalCreated = 0;
  let totalUpdated = 0;
  const allCometIds: string[] = [];

  for (const source of sources) {
    if (!source.key) continue;

    const persons = await fetchAllPages(source.key);
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
        const existing = await prisma.coach.findFirst({ where: { cometId } });

        const syncCore = {
          firstName,
          lastName: (c.lastName as string) || '',
          middleName,
          birthDate,
          nationality: (c.nationality as string) || null,
          isActive: true,
          type: source.type,
        };

        if (existing) {
          await prisma.coach.update({ where: { id: existing.id }, data: syncCore });
          updated++;
        } else {
          const positionRaw = positionForNewRecordFromComet(c);
          await prisma.coach.create({
            data: {
              ...syncCore,
              position: positionRaw || null,
              photoUrl: (c.photo as string) || null,
              cometId,
              isManuallyCreated: false,
              isPublished: true,
            },
          });
          created++;
        }

        allCometIds.push(cometId);
      } catch {
        /* skip row */
      }
    }

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

  return {
    success: true,
    created: totalCreated,
    updated: totalUpdated,
    deactivated: deactivated.count,
  };
}
