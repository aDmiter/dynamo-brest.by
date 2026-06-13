import type { Prisma } from '@prisma/client';

/** Дата «уточняется» из синхронизации COMET (нет timestamp в API). */
export const MATCH_TBD_DATE_MAX = new Date('1970-01-02T00:00:00.000Z');

export function isMatchTbdDate(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() <= MATCH_TBD_DATE_MAX.getTime();
}

function withPublishedFilter(
  where: Prisma.matchWhereInput,
  publicOnly: boolean
): Prisma.matchWhereInput {
  if (!publicOnly) return where;
  return { AND: [where, { isPublished: true }] };
}

/** Предстоящие матчи для календаря: только scheduled, дата в будущем или TBD. */
export function calendarMatchWhere(
  teamId: string,
  now = new Date(),
  publicOnly = false
): Prisma.matchWhereInput {
  return withPublishedFilter(
    {
      teamId,
      status: 'scheduled',
      OR: [{ matchDate: { gte: now } }, { matchDate: { lte: MATCH_TBD_DATE_MAX } }],
    },
    publicOnly
  );
}

/**
 * Сыгранные матчи для результатов:
 * finished (СЫГРАНО в COMET) или прошедшие scheduled со счётом.
 */
export function resultsMatchWhere(
  teamId: string,
  now = new Date(),
  publicOnly = false
): Prisma.matchWhereInput {
  return withPublishedFilter(
    {
      teamId,
      OR: [
        { status: 'finished' },
        {
          status: 'scheduled',
          matchDate: { lt: now, gt: MATCH_TBD_DATE_MAX },
          homeScore: { not: null },
          awayScore: { not: null },
        },
      ],
    },
    publicOnly
  );
}

/** Фильтр опубликованных матчей для произвольного запроса (главная, билеты и т.д.). */
export function publishedMatchFilter(publicOnly: boolean): Prisma.matchWhereInput {
  return publicOnly ? { isPublished: true } : {};
}
