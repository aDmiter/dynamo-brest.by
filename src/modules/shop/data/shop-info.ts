/** Контакты и тексты для страниц интернет-магазина (bePaid, эквайринг). */

import {
  BEPAID_SITE_URL,
  ORG_LEGAL_ADDRESS,
  SHOP_CONTACT_EMAIL,
  SHOP_CONTACT_PHONE,
  SHOP_CONTACT_PHONE_HREF,
} from '@/modules/shop/data/organization-requisites';

export const SHOP_HERO_IMAGE = '/images/cart-bg.jpg';

export const SHOP_SUPPORT_EMAIL = SHOP_CONTACT_EMAIL;
export const SHOP_SUPPORT_PHONE = SHOP_CONTACT_PHONE;
export const SHOP_SUPPORT_PHONE_HREF = SHOP_CONTACT_PHONE_HREF;

export const SHOP_POSTAL_ADDRESS = ORG_LEGAL_ADDRESS;

export { BEPAID_SITE_URL };

export const BEPAID_PAYMENT_INFO_URL = `${BEPAID_SITE_URL}/kak-oplatit`;

export const ORDER_STEPS = [
  'Выберите товар в каталоге и укажите размер (при необходимости).',
  'Добавьте товар в корзину.',
  'Перейдите в корзину и нажмите «Оформить заказ».',
  'Заполните контактные данные, адрес доставки и выберите страну доставки.',
  'Подтвердите заказ и оплатите банковской картой через защищённый виджет bePaid.',
  'После успешной оплаты вы получите подтверждение на указанный e-mail.',
] as const;
