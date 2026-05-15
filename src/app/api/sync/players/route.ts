// src/app/api/sync/players/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSetting } from '@/lib/settings';
import { transliterate } from '@/lib/utils';

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
}

async function fetchPage(
  page: number,
  pageSize: number,
  apiKey: string
): Promise<CometPlayerData[]> {
  const COMET_BASE_URL = process.env.COMET_API_BASE_URL || 'https://comet.abff.by';
  const url = `${COMET_BASE_URL}/data-backend/api/public/areports/run/${page}/${pageSize}/?API_KEY=${apiKey}`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    console.error(`❌ page ${page}: HTTP ${response.status}`);
    return [];
  }

  const data: CometResponse = await response.json();
  return data.results || [];
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

export async function POST(request: NextRequest) {
  try {
    const dbKey = await getSetting('COMET_API_KEY_PLAYERS');
    const envKey = process.env.COMET_API_KEY_PLAYERS || '';
    const COMET_API_KEY = dbKey || envKey;

    if (!COMET_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    console.log('🔄 Запуск синхронизации игроков из COMET...');

    const pageSize = 500;
    let page = 0;
    const allResults: CometPlayerData[] = [];

    while (true) {
      const results = await fetchPage(page, pageSize, COMET_API_KEY);
      if (results.length === 0) break;
      allResults.push(...results);
      page++;
      if (results.length === pageSize) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    const filtered = allResults.filter(
      (p) => p.orgName === 'Динамо-Брест' && p.registrationStatus === 'Подтверждено'
    );

    if (filtered.length === 0) {
      return NextResponse.json({ message: 'Нет данных', total: 0, created: 0, updated: 0 });
    }

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    const positionMap: Record<string, string> = {
      GOALKEEPER: 'Вратарь',
      DEFENDER: 'Защитник',
      MIDFIELDER: 'Полузащитник',
      FORWARD: 'Нападающий',
    };

    for (const p of filtered) {
      try {
        const cometId = p.personId?.toString() || '';
        if (!cometId) continue;

        const nameParts = (p.firstName || '').trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const middleName = nameParts.slice(1).join(' ') || null;
        const lastName = p.lastName || '';

        const levelRaw = (p.level || '').toLowerCase();
        const genderRaw = (p.gender || '').toLowerCase();

        const updateData = {
          firstName,
          lastName,
          middleName,
          birthDate: p.dateOfBirth ? new Date(p.dateOfBirth) : null,
          nationality: p.nationality || null,
          position: positionMap[p.titlePlayer] || p.titlePlayer || null,
          level: levelRaw.includes('профессионал')
            ? 'professional'
            : levelRaw.includes('любитель')
              ? 'amateur'
              : null,
          gender: genderRaw.includes('муж') ? 'male' : genderRaw.includes('жен') ? 'female' : null,
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
      } catch (err) {
        errors.push(`Ошибка ${p.personId}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    return NextResponse.json({
      success: true,
      total: filtered.length,
      created,
      updated,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
