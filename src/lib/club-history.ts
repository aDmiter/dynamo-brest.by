import { prisma } from '@/lib/prisma';
import {
  CLUB_HISTORY_INTRO_BLOCKS,
  CLUB_HISTORY_YEARS,
} from '@/config/club-history-data';
import {
  blocksToContentHtml,
  blocksToImages,
} from '@/lib/club-history-migrate';
import type { PublicClubHistory, PublicClubHistoryYear } from '@/lib/club-history-types';

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildTeaser(contentHtml: string, max = 220): string {
  const plain = stripHtml(contentHtml);
  if (!plain) return '';
  return plain.length > max ? `${plain.slice(0, max - 1).trim()}…` : plain;
}

function mapYear(row: {
  id: string;
  label: string;
  year: number;
  highlight: boolean;
  contentHtml: string;
  images: { url: string; alt: string; sortOrder: number }[];
}): PublicClubHistoryYear {
  const images = [...row.images].sort((a, b) => a.sortOrder - b.sortOrder);
  const cover = images[0] ?? null;
  const gallery = images.slice(1).map((img) => ({ url: img.url, alt: img.alt }));

  return {
    id: row.id,
    label: row.label,
    year: row.year,
    highlight: row.highlight,
    teaser: buildTeaser(row.contentHtml),
    contentHtml: row.contentHtml,
    coverUrl: cover?.url ?? null,
    gallery,
  };
}

function getStaticFallback(): PublicClubHistory {
  const introImages = blocksToImages(
    CLUB_HISTORY_INTRO_BLOCKS.filter((b) => b.type === 'image'),
  );
  const introText = CLUB_HISTORY_INTRO_BLOCKS.filter((b) => b.type !== 'image');

  return {
    intro: {
      contentHtml: blocksToContentHtml(introText),
      coverUrl: introImages[0]?.url ?? null,
    },
    years: CLUB_HISTORY_YEARS.map((entry) => {
      const images = blocksToImages(entry.blocks);
      const cover = images[0] ?? null;
      return {
        id: `static-${entry.year}`,
        label: entry.label,
        year: entry.year,
        highlight: entry.highlight,
        teaser: entry.teaser,
        contentHtml: blocksToContentHtml(
          entry.blocks.filter((b) => b.type !== 'image'),
        ),
        coverUrl: cover?.url ?? null,
        gallery: images.slice(1).map((img) => ({ url: img.url, alt: img.alt })),
      };
    }),
  };
}

export async function getClubHistoryPublic(): Promise<PublicClubHistory> {
  try {
    const [introRow, years] = await Promise.all([
      prisma.clubHistoryIntro.findUnique({ where: { id: 'main' } }),
      prisma.clubHistoryYear.findMany({
        where: { isActive: true },
        include: { images: { orderBy: { sortOrder: 'asc' } } },
        orderBy: { sortOrder: 'asc' },
      }),
    ]);

    if (years.length === 0) {
      return getStaticFallback();
    }

    return {
      intro: {
        contentHtml: introRow?.contentHtml ?? '',
        coverUrl: introRow?.coverUrl ?? null,
      },
      years: years.map(mapYear),
    };
  } catch {
    return getStaticFallback();
  }
}

export function getClubHistoryDecades(years: PublicClubHistoryYear[]): number[] {
  const decades = new Set<number>();
  for (const entry of years) {
    decades.add(Math.floor(entry.year / 10) * 10);
  }
  return [...decades].sort((a, b) => b - a);
}
