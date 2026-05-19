export type ClubPartnerLogo = {
  src: string;
  alt: string;
  href?: string;
};

const IMG = '/images/partners/sponsors';

/** Активные на dynamo-brest.by/club/partners-and-sponsors */
export const CLUB_TITLE_SPONSORS: ClubPartnerLogo[] = [
  {
    src: `${IMG}/savushkin-colored-2025.png`,
    alt: 'Савушкин',
    href: 'https://www.savushkin.com/',
  },
];

export const CLUB_GENERAL_PARTNERS: ClubPartnerLogo[] = [
  {
    src: `${IMG}/FONBET_Logo_Black.png`,
    alt: 'FONBET',
  },
];

export const CLUB_PARTNERS: ClubPartnerLogo[] = [
  { src: `${IMG}/Prodtovary.png`, alt: 'Продтовары', href: 'https://prodtovary.com/' },
  { src: `${IMG}/belmoris_logo_colored.png`, alt: 'Белморис', href: 'https://belmoris.by/' },
  { src: `${IMG}/shedro-colored.png`, alt: 'Щедрые Пружаны' },
  { src: `${IMG}/pikant-colored.png`, alt: 'Пинский мясокомбинат' },
  { src: `${IMG}/kobrin_cheese_colored.png`, alt: 'Кобринские сыры' },
  { src: `${IMG}/druzhba_logo_colored.png`, alt: 'Дружба' },
  { src: `${IMG}/ostromechevo_logo_colored.png`, alt: 'Остромечево', href: 'https://ostromechevo.by/' },
  { src: `${IMG}/niva_logo_colored.png`, alt: 'Прибужская нива' },
  { src: `${IMG}/berest-pekar_logo_colored.png`, alt: 'Берестейский пекарь' },
  { src: `${IMG}/bakaleya_logo_colored.png`, alt: 'Бакалея', href: 'http://www.brestbakaleya.com/' },
  { src: `${IMG}/zhabinka_logo_2024_colored.png`, alt: 'Жабинковский сахарный завод' },
  { src: `${IMG}/bgs-colored-2.png`, alt: 'Белгосстрах' },
  { src: `${IMG}/intourist_logo_colored.png`, alt: 'Интурист' },
  { src: `${IMG}/a1_logo_colored.png`, alt: 'A1' },
  { src: `${IMG}/oily_logo_colored.png`, alt: 'Oily' },
];

export const CLUB_PARTNERS_CONTACT = {
  phone: '+375 (29) 790 21 02',
  phoneHref: 'tel:+375297902102',
  email: 'info@dynamo-brest.by',
};
