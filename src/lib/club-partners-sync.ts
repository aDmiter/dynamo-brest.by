import { prisma } from '@/lib/prisma';
import {
  CLUB_PARTNER_SECTIONS,
  DEFAULT_CLUB_PARTNERS_CTA_HTML,
  type ClubPartnerSectionId,
  type ClubPartnersPageData,
} from '@/lib/club-partners';
import { buildClubPartnersPageHtml } from '@/lib/club-partners-html';

const MENU_SLUG = 'club-partners';

export async function loadClubPartnersData(options?: {
  /** Только для публикации на сайте */
  activeOnly?: boolean;
}): Promise<ClubPartnersPageData> {
  const [page, logos] = await Promise.all([
    prisma.clubPartnersPage.findUnique({ where: { id: 'main' } }),
    prisma.clubPartnerLogo.findMany({
      where: options?.activeOnly ? { isActive: true } : undefined,
      orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
    }),
  ]);

  const data: ClubPartnersPageData = {
    ctaHtml: page?.ctaHtml?.trim() || DEFAULT_CLUB_PARTNERS_CTA_HTML,
    title: [],
    general: [],
    partners: [],
  };

  for (const row of logos) {
    const section = row.section as ClubPartnerSectionId;
    if (section !== 'title' && section !== 'general' && section !== 'partners') continue;
    data[section].push({
      id: row.id,
      src: row.src,
      alt: row.alt,
      href: row.href,
      sortOrder: row.sortOrder,
      isActive: row.isActive,
    });
  }

  return data;
}

/** Обновить pageContent у пункта меню club-partners */
export async function syncClubPartnersToCms(): Promise<void> {
  const data = await loadClubPartnersData({ activeOnly: true });
  const html = buildClubPartnersPageHtml(data);

  await prisma.menuitem.updateMany({
    where: { slug: MENU_SLUG, type: 'page' },
    data: { pageContent: html },
  });
}

export function isClubPartnerSection(value: string): value is ClubPartnerSectionId {
  return CLUB_PARTNER_SECTIONS.some((s) => s.id === value);
}
