import {
  CLUB_GENERAL_PARTNERS,
  CLUB_PARTNERS,
  CLUB_PARTNERS_CONTACT,
  CLUB_TITLE_SPONSORS,
  type ClubPartnerLogo,
} from '@/config/club-partners';
import { escapeHtml } from '@/lib/html';

function partnerItemHtml(logo: ClubPartnerLogo): string {
  const img = `<img src="${escapeHtml(logo.src)}" alt="${escapeHtml(logo.alt)}" loading="lazy" />`;
  if (logo.href) {
    return `<a class="club-partners-content__item" href="${escapeHtml(logo.href)}" target="_blank" rel="noopener noreferrer">${img}</a>`;
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

export function clubPartnersPageHtml(): string {
  const { phone, phoneHref, email } = CLUB_PARTNERS_CONTACT;

  return `<div class="club-partners-content">
${sectionHtml('Титульные спонсоры', 'club-partners-title', CLUB_TITLE_SPONSORS)}
${sectionHtml('Генеральный партнер', 'club-partners-general', CLUB_GENERAL_PARTNERS)}
${sectionHtml('Партнеры', 'club-partners-list', CLUB_PARTNERS)}
<section class="club-partners-content__section club-partners-content__section--cta" aria-labelledby="club-partners-cta-title">
<h2 id="club-partners-cta-title" class="club-partners-content__section-title">Стать партнером</h2>
<p class="club-partners-content__text">По вопросам партнёрства и размещения рекламы свяжитесь с клубом:</p>
<div class="club-partners-content__contacts">
<p class="club-partners-content__contact-line">Телефон: <a href="${phoneHref}" class="club-partners-content__link">${escapeHtml(phone)}</a></p>
<p class="club-partners-content__contact-line">Почта: <a href="mailto:${escapeHtml(email)}" class="club-partners-content__link">${escapeHtml(email)}</a></p>
</div>
</section>
</div>`;
}
