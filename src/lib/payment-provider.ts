/** Активный эквайринг магазина. WebPay остаётся в коде — переключение через env. */
export type ShopPaymentProvider = 'bepaid' | 'webpay';

export function getShopPaymentProvider(): ShopPaymentProvider {
  const value = process.env.SHOP_PAYMENT_PROVIDER?.toLowerCase();
  if (value === 'webpay') return 'webpay';
  return 'bepaid';
}

export function isBePaidProvider(): boolean {
  return getShopPaymentProvider() === 'bepaid';
}
