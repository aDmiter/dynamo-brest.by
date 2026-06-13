import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBagShopping,
  faCalendarDays,
  faEnvelope,
  faHouse,
  faNewspaper,
  faTableList,
  faTicket,
  faUserGroup,
} from '@fortawesome/free-solid-svg-icons';

export type NotFoundQuickLink = {
  href: string;
  label: string;
  description: string;
  icon: IconDefinition;
};

/** Популярные разделы для страницы 404 (старые URL с dynamo-brest.by). */
export const NOT_FOUND_QUICK_LINKS: NotFoundQuickLink[] = [
  {
    href: '/',
    label: 'Главная',
    description: 'Новости, матчи и магазин',
    icon: faHouse,
  },
  {
    href: '/news',
    label: 'Новости',
    description: 'Все публикации клуба',
    icon: faNewspaper,
  },
  {
    href: '/team/main/players',
    label: 'Состав',
    description: 'Игроки основной команды',
    icon: faUserGroup,
  },
  {
    href: '/team/main/calendar',
    label: 'Календарь',
    description: 'Расписание и результаты',
    icon: faCalendarDays,
  },
  {
    href: '/team/main/table',
    label: 'Таблица',
    description: 'Турнирное положение',
    icon: faTableList,
  },
  {
    href: '/shop/catalog',
    label: 'Магазин',
    description: 'Форма и атрибутика',
    icon: faBagShopping,
  },
  {
    href: '/page/tickets',
    label: 'Билеты',
    description: 'Покупка на матч',
    icon: faTicket,
  },
  {
    href: '/club/contacts',
    label: 'Контакты',
    description: 'Связаться с клубом',
    icon: faEnvelope,
  },
];
