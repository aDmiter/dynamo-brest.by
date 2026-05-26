export type ClubPartnerSectionId = 'title' | 'general' | 'partners';

export type ClubPartnerLogo = {
  id?: string;
  src: string;
  alt: string;
  href?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export type ClubPartnersPageData = {
  ctaHtml: string;
  title: ClubPartnerLogo[];
  general: ClubPartnerLogo[];
  partners: ClubPartnerLogo[];
};

export const CLUB_PARTNER_SECTIONS: { id: ClubPartnerSectionId; label: string }[] = [
  { id: 'title', label: 'Титульные спонсоры' },
  { id: 'general', label: 'Генеральный партнер' },
  { id: 'partners', label: 'Партнеры' },
];

export const DEFAULT_CLUB_PARTNERS_CTA_HTML = `<p class="club-partners-content__text">По вопросам партнёрства и размещения рекламы свяжитесь с клубом:</p>
<div class="club-partners-content__contacts">
<p class="club-partners-content__contact-line">Телефон: <a href="tel:+375297902102" class="club-partners-content__link">+375 (29) 790 21 02</a></p>
<p class="club-partners-content__contact-line">Почта: <a href="mailto:info@dynamo-brest.by" class="club-partners-content__link">info@dynamo-brest.by</a></p>
</div>`;
