import {
  CLUB_GENERAL_PARTNERS,
  CLUB_PARTNERS,
  CLUB_TITLE_SPONSORS,
} from '@/config/club-partners';
import type { ClubPartnerLogo, ClubPartnersPageData, ClubPartnerSectionId } from '@/lib/club-partners';
import { CLUB_PARTNER_SECTIONS, DEFAULT_CLUB_PARTNERS_CTA_HTML } from '@/lib/club-partners';
import { escapeHtml } from '@/lib/html';

function partnerItemHtml(logo: ClubPartnerLogo): string {
  const img = `<img src="${escapeHtml(logo.src)}" alt="${escapeHtml(logo.alt)}" loading="lazy" />`;
  if (logo.href?.trim()) {
    return `<a class="club-partners-content__item" href="${escapeHtml(logo.href.trim())}" target="_blank" rel="noopener noreferrer">${img}</a>`;
  }
  return `<div class="club-partners-content__item">${img}</div>`;
}

function partnersGridHtml(logos: ClubPartnerLogo[]): string {
  if (logos.length === 0) return '';
  return `<div class="club-partners-content__grid">${logos.map(partnerItemHtml).join('')}</div>`;
}

function sectionHtml(title: string, id: string, logos: ClubPartnerLogo[]): string {
  if (logos.length === 0) return '';
  return `<section class="club-partners-content__section" aria-labelledby="${id}">
<h2 id="${id}" class="club-partners-content__section-title">${escapeHtml(title)}</h2>
${partnersGridHtml(logos)}
</section>`;
}

const SECTION_HTML_IDS: Record<ClubPartnerSectionId, string> = {
  title: 'club-partners-title',
  general: 'club-partners-general',
  partners: 'club-partners-list',
};

export function buildClubPartnersPageHtml(data: ClubPartnersPageData): string {
  const sections = CLUB_PARTNER_SECTIONS.map(({ id, label }) =>
    sectionHtml(label, SECTION_HTML_IDS[id], data[id]),
  ).join('');

  const cta = (data.ctaHtml?.trim() || DEFAULT_CLUB_PARTNERS_CTA_HTML).trim();

  return `<div class="club-partners-content">
${sections}
<section class="club-partners-content__section club-partners-content__section--cta" aria-labelledby="club-partners-cta-title">
<h2 id="club-partners-cta-title" class="club-partners-content__section-title">Стать партнером</h2>
${cta}
</section>
</div>`;
}

/** Статический HTML из config (сид / fix-coded-cms-pages) */
export function clubPartnersPageHtml(): string {
  return buildClubPartnersPageHtml({
    ctaHtml: DEFAULT_CLUB_PARTNERS_CTA_HTML,
    title: CLUB_TITLE_SPONSORS,
    general: CLUB_GENERAL_PARTNERS,
    partners: CLUB_PARTNERS,
  });
}
