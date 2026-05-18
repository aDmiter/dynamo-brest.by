/** Контакты и тексты для страниц интернет-магазина (эквайринг, WebPay). */

export const SHOP_HERO_IMAGE = '/images/cart-bg.jpg';

export const SHOP_SUPPORT_EMAIL = 'info@dynamo-brest.by';
export const SHOP_SUPPORT_PHONE = '+375 (162) 20-85-32';
export const SHOP_SUPPORT_PHONE_HREF = 'tel:+375162208532';

export const SHOP_POSTAL_ADDRESS =
  '224005, Республика Беларусь, г. Брест, ул. Гоголя, 9';

export const WEBPAY_SITE_URL = 'https://www.webpay.by';
export const WEBPAY_RECEIPT_SAMPLE_URL = 'https://www.webpay.by/documents';

export const ORDER_STEPS = [
  'Выберите товар в каталоге и укажите размер (при необходимости).',
  'Добавьте товар в корзину.',
  'Перейдите в корзину и нажмите «Оформить заказ».',
  'Заполните контактные данные, адрес доставки и выберите страну доставки.',
  'Подтвердите заказ и перейдите к оплате на защищённую страницу WebPay.',
  'После успешной оплаты вы получите подтверждение на указанный e-mail.',
] as const;
