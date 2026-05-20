import type { Metadata } from 'next';
import { gymHeroImage } from '@/modules/shared/data/gym-services';

export type CodedCmsPageConfig = {
  path: string;
  defaultSubtitle: string;
  watermark: string;
  metadata: Metadata;
  defaultHeroHeader?: boolean;
  defaultImageUrl?: string;
  lightContent?: boolean;
};

/** CMSTextPage на фиксированных маршрутах (menuitem type=page) */
export const CODED_CMS_PAGES: Record<string, CodedCmsPageConfig> = {
  'services-transport': {
    path: '/services/transport',
    defaultSubtitle: 'Услуги',
    watermark: 'Услуги',
    metadata: {
      title: 'Транспортные услуги в Бресте | Динамо-Брест',
      description:
        'ФК «Динамо-Брест» предлагает услуги автобусов с водителем для пассажирских перевозок по РБ, странам СНГ, Прибалтики и Европы.',
    },
  },
  'services-fields': {
    path: '/services/fields',
    defaultSubtitle: 'Услуги',
    watermark: 'Услуги',
    metadata: {
      title: 'Услуги футбольных полей | Динамо-Брест',
      description:
        'Аренда футбольных полей ФК «Динамо-Брест»: ОСК «Брестский», учебно-тренировочная база, футбольная школа, манеж, стадион «Юность».',
    },
  },
  'services-cafe': {
    path: '/services/cafe',
    defaultSubtitle: 'Услуги',
    watermark: 'Услуги',
    metadata: {
      title: 'Кафе «5 колец» | Динамо-Брест',
      description: 'Кафе домашней кухни «5 колец» на базе ФК «Динамо-Брест».',
    },
  },
  'services-hotel': {
    path: '/services/hotel',
    defaultSubtitle: 'Услуги',
    watermark: 'Услуги',
    metadata: {
      title: 'Гостиница «5 колец» | Динамо-Брест',
      description: 'Гостиница «5 колец» в центре Бреста на базе ФК «Динамо-Брест».',
    },
  },
  'services-gym': {
    path: '/services/gym',
    defaultSubtitle: 'Услуги',
    watermark: 'Услуги',
    defaultHeroHeader: true,
    defaultImageUrl: gymHeroImage,
    lightContent: true,
    metadata: {
      title: 'Тренажёрный зал в центре Бреста | Динамо-Брест',
      description:
        'Тренажёрный зал ФК «Динамо-Брест» на стадионе «Брестский»: режим работы, цены, абонементы. ул. Гоголя, 9.',
    },
  },
  'school-about': {
    path: '/school/about',
    defaultSubtitle: 'Школа',
    watermark: 'Школа',
    metadata: { title: 'О школе | Динамо-Брест', description: 'Футбольная школа ФК «Динамо-Брест».' },
  },
  'school-join': {
    path: '/school/join',
    defaultSubtitle: 'Школа',
    watermark: 'Школа',
    metadata: { title: 'Как попасть в школу | Динамо-Брест', description: 'Набор в футбольную школу.' },
  },
  'school-tournaments': {
    path: '/school/tournaments',
    defaultSubtitle: 'Школа',
    watermark: 'Школа',
    metadata: { title: 'Турниры | Динамо-Брест', description: 'Турниры футбольной школы.' },
  },
  'school-teams': {
    path: '/school/teams',
    defaultSubtitle: 'Школа',
    watermark: 'Школа',
    metadata: { title: 'Команды | Динамо-Брест', description: 'Команды футбольной школы.' },
  },
  'fans-supporters': {
    path: '/fans',
    defaultSubtitle: 'Фан-зона',
    watermark: 'Фан-зона',
    metadata: {
      title: 'Болельщики | Динамо-Брест',
      description: 'Правила поведения болельщиков на стадионе.',
    },
  },
  'shop-delivery': {
    path: '/shop/delivery',
    defaultSubtitle: 'Интернет-магазин',
    watermark: 'Магазин',
    metadata: {
      title: 'Доставка | Интернет-магазин | Динамо-Брест',
      description: 'Доставка товаров интернет-магазина ФК «Динамо-Брест».',
    },
  },
  'shop-payment': {
    path: '/shop/payment',
    defaultSubtitle: 'Интернет-магазин',
    watermark: 'Магазин',
    metadata: {
      title: 'Оплата | Интернет-магазин | Динамо-Брест',
      description: 'Оплата заказов через bePaid.',
    },
  },
  'shop-returns': {
    path: '/shop/returns',
    defaultSubtitle: 'Интернет-магазин',
    watermark: 'Магазин',
    metadata: {
      title: 'Возврат товара | Интернет-магазин | Динамо-Брест',
      description: 'Условия возврата товара.',
    },
  },
  'club-contacts': {
    path: '/club/contacts',
    defaultSubtitle: 'Клуб',
    watermark: 'Клуб',
    metadata: {
      title: 'Контакты | Динамо-Брест',
      description: 'Контакты ФК «Динамо-Брест».',
    },
  },
  'club-partners': {
    path: '/club/partners',
    defaultSubtitle: 'Клуб',
    watermark: 'Клуб',
    metadata: {
      title: 'Партнеры и спонсоры | Динамо-Брест',
      description: 'Титульные спонсоры, генеральный партнер и партнёры ФК «Динамо-Брест».',
    },
  },
  'club-stadium': {
    path: '/club/stadium',
    defaultSubtitle: 'Клуб',
    watermark: 'Клуб',
    metadata: {
      title: 'Стадион | Динамо-Брест',
      description: 'Областной спортивный комплекс «Брестский» — домашняя арена ФК «Динамо-Брест».',
    },
  },
  'media-press': {
    path: '/media/press',
    defaultSubtitle: 'Медиа',
    watermark: 'Медиа',
    metadata: {
      title: 'Для СМИ | Динамо-Брест',
      description:
        'Информация для СМИ: контакты пресс-службы, социальные сети и фирменный стиль ФК «Динамо-Брест».',
    },
  },
  'media-anthems': {
    path: '/media/anthems',
    defaultSubtitle: 'Медиа',
    watermark: 'Медиа',
    metadata: {
      title: 'Гимны | Динамо-Брест',
      description: 'Официальные и фанатские гимны ФК «Динамо-Брест».',
    },
  },
};
