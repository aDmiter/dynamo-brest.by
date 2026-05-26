/** Русские тексты интерфейса (источник правды). BY — в таблице translation, locale `be`. */

export const UI_TRANSLATION_DEFAULTS = {
  'ui.nav.team': 'Команда',
  'ui.nav.calendar': 'Календарь',
  'ui.nav.table': 'Таблица',
  'ui.nav.news': 'Новости',
  'ui.nav.shop': 'Магазин',
  'ui.cart': 'Корзина',
  'ui.lang.ru': 'RU',
  'ui.lang.be': 'BY',
  'ui.burger.menu': 'Меню',
  'ui.burger.close': 'Закрыть меню',
  'ui.burger.home': 'На главную',
  'ui.footer.mail': 'Почта:',
  'ui.footer.phone': 'Телефон:',
  'ui.footer.official': 'Official Website of FC Dynamo Brest',
  'ui.footer.created_by': 'Создание сайта: WEBO.by',
  'ui.footer.copyright': 'ФК «Динамо-Брест»',
} as const;

export type UiTranslationKey = keyof typeof UI_TRANSLATION_DEFAULTS;

export const UI_TRANSLATION_KEYS = Object.keys(
  UI_TRANSLATION_DEFAULTS,
) as UiTranslationKey[];

export interface UiTranslationGroup {
  id: string;
  label: string;
  keys: UiTranslationKey[];
}

export const UI_TRANSLATION_GROUPS: UiTranslationGroup[] = [
  {
    id: 'nav',
    label: 'Навигация (шапка)',
    keys: [
      'ui.nav.team',
      'ui.nav.calendar',
      'ui.nav.table',
      'ui.nav.news',
      'ui.nav.shop',
      'ui.cart',
    ],
  },
  {
    id: 'lang',
    label: 'Переключатель языка',
    keys: ['ui.lang.ru', 'ui.lang.be'],
  },
  {
    id: 'burger',
    label: 'Мобильное меню',
    keys: ['ui.burger.menu', 'ui.burger.close', 'ui.burger.home'],
  },
  {
    id: 'footer',
    label: 'Подвал',
    keys: [
      'ui.footer.mail',
      'ui.footer.phone',
      'ui.footer.official',
      'ui.footer.created_by',
      'ui.footer.copyright',
    ],
  },
];
