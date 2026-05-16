export const TICKETS_AFISHA_URL = 'https://24afisha.by/ru/brest/events/sport';
export const TICKETS_SUPPORT_PHONE = '+375 (33) 324-22-00';
export const TICKETS_SUPPORT_PHONE_HREF = 'tel:+375333242200';
export const TICKETS_SUPPORT_EMAIL = 'afisha@24afisha.by';
export const TICKETS_STADIUM_ADDRESS = 'г. Брест, ул. Гоголя, 9';

export const ticketsPurchaseChannels = [
  {
    id: 'box-office',
    title: 'Кассы',
    description:
      'Билеты можно купить в кассах стадиона ОСК «Брестский» (г. Брест, ул. Гоголя, 9).',
    note: 'В день матча с 11:00 до конца первого тайма',
    icon: 'ticket' as const,
  },
  {
    id: 'online',
    title: 'Интернет',
    description:
      'Билеты можно купить онлайн через официальный сайт «Динамо-Брест» или сайт 24afisha.by — билетного оператора ФК «Динамо-Брест».',
    note: 'PDF-билет с уникальным штрих-кодом придёт на e-mail',
    icon: 'globe' as const,
    href: TICKETS_AFISHA_URL,
  },
];

export const ticketsOnlineNotice =
  'На указанный e-mail придёт письмо с PDF-версией билета. Она содержит уникальный штрих-код — ваш пропуск на стадион. Не публикуйте штрих-код в соцсетях и не показывайте его публично.';

export const ticketsPaymentMethods = [
  {
    title: 'Банковская карта',
    description:
      'Оплату можно осуществить любой банковской пластиковой картой. Платёж проходит по защищённому протоколу — это полностью безопасная операция.',
  },
];

export interface TicketPriceRow {
  name: string;
  sectors: string;
  standard: string;
  concession: string;
}

export interface TicketPriceGroup {
  id: string;
  title: string;
  rows: TicketPriceRow[];
}

/** Цены на билеты, сезон 2026 (ОСК «Брестский») */
export const ticketsPricesSeason2026: TicketPriceGroup[] = [
  {
    id: 'east',
    title: 'Восточная трибуна',
    rows: [
      { name: 'Гостевой', sectors: 'Секторы 1–2', standard: '6,0', concession: '4,0' },
      { name: 'Восток', sectors: 'Секторы 3–8', standard: '6,0', concession: '4,0' },
    ],
  },
  {
    id: 'west',
    title: 'Западная трибуна',
    rows: [
      {
        name: 'Стандарт',
        sectors: 'Секторы 10–13, 16–24, 27–31',
        standard: '10,0',
        concession: '8,0',
      },
      {
        name: 'Премиум',
        sectors: 'Секторы 14–15, 25–26',
        standard: '12,0',
        concession: '10,0',
      },
    ],
  },
];

export const ticketsPromotions = [
  {
    title: 'Семьи с детьми',
    description:
      'Дети до 7 лет в сопровождении совершеннолетнего посещают матчи бесплатно, без права занятия места.',
  },
  {
    title: 'Льготники',
    description:
      'Дети до 14 лет, пенсионеры и инвалиды имеют право на льготу при предъявлении подтверждающего документа. Для инвалидов-колясочников предусмотрен бесплатный вход с одним сопровождающим в специально оборудованное место в чаше стадиона.',
  },
];
