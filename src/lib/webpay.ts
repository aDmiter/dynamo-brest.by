// src/lib/webpay.ts - Клиент для работы с WEBPAY (прямая форма)
import crypto from 'crypto';

// ====================== КОНФИГУРАЦИЯ ======================

const STORE_ID = process.env.WEBPAY_STORE_ID || '584426783';
const SECRET_KEY = process.env.WEBPAY_SECRET_KEY || 'dynamo-brest-secret-key-2024';
const IS_TEST = process.env.NODE_ENV === 'development' || process.env.WEBPAY_TEST === '1';

const PAYMENT_URL = IS_TEST ? 'https://securesandbox.webpay.by' : 'https://payment.webpay.by';

// ====================== ФОРМИРОВАНИЕ ПЛАТЕЖНОЙ ФОРМЫ ======================

export interface CartItem {
  name: string;
  quantity: number;
  price: number;
}

export interface PaymentParams {
  orderNum: string;
  items: CartItem[];
  total: number;
  shippingName?: string;
  shippingPrice?: number;
  discountName?: string;
  discountPrice?: number;
  tax?: number;
  returnUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
}

/**
 * Генерирует параметры для POST-формы перенаправления на WEBPAY
 */
export function getWebPayFormParams(params: PaymentParams): Record<string, string> {
  const {
    orderNum,
    items,
    total,
    shippingName,
    shippingPrice,
    discountName,
    discountPrice,
    tax,
    returnUrl,
    cancelUrl,
    customerEmail,
    customerName,
    customerPhone,
    customerAddress,
  } = params;

  // Очищаем номер заказа от #
  const cleanOrderNum = orderNum.replace('#', '');

  // Генерируем seed
  const seed = Date.now().toString();

  const formParams: Record<string, string> = {
    '*scart': '',
    wsb_version: '2',
    wsb_storeid: STORE_ID,
    wsb_order_num: cleanOrderNum,
    wsb_currency_id: 'BYN',
    wsb_seed: seed,
    wsb_test: IS_TEST ? '1' : '0',
    wsb_return_url: returnUrl,
    wsb_cancel_return_url: cancelUrl,
    wsb_notify_url: process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/webpay/callback`
      : 'http://localhost:3000/api/webpay/callback',
    wsb_total: total.toFixed(2),
  };

  // Корзина товаров
  items.forEach((item, index) => {
    formParams[`wsb_invoice_item_name[${index}]`] = item.name;
    formParams[`wsb_invoice_item_quantity[${index}]`] = item.quantity.toString();
    formParams[`wsb_invoice_item_price[${index}]`] = item.price.toFixed(2);
  });

  // Необязательные поля
  if (customerEmail) formParams.wsb_email = customerEmail;
  if (customerName) formParams.wsb_customer_name = customerName;
  if (customerPhone) formParams.wsb_phone = customerPhone;
  if (customerAddress) formParams.wsb_customer_address = customerAddress;
  if (shippingName) formParams.wsb_shipping_name = shippingName;
  if (shippingPrice && shippingPrice > 0) formParams.wsb_shipping_price = shippingPrice.toFixed(2);
  if (discountName) formParams.wsb_discount_name = discountName;
  if (discountPrice && discountPrice > 0) formParams.wsb_discount_price = discountPrice.toFixed(2);
  if (tax && tax > 0) formParams.wsb_tax = tax.toFixed(2);

  // Формируем подпись
  const signature = generateSignature(
    seed,
    cleanOrderNum,
    IS_TEST ? '1' : '0',
    'BYN',
    total.toFixed(2)
  );

  formParams.wsb_signature = signature;

  console.log('💳 WebPay form params:', {
    storeId: STORE_ID,
    orderNum: cleanOrderNum,
    items: items.length,
    total: total.toFixed(2),
    seed,
    isTest: IS_TEST,
    signature: signature.substring(0, 10) + '...',
  });

  return formParams;
}

/**
 * Генерирует цифровую подпись для формы оплаты
 * Формат: SHA1(seed + storeid + order_num + test + currency_id + total + secret_key)
 */
function generateSignature(
  seed: string,
  orderNum: string,
  test: string,
  currencyId: string,
  total: string
): string {
  const signatureString = seed + STORE_ID + orderNum + test + currencyId + total + SECRET_KEY;
  return crypto.createHash('sha1').update(signatureString).digest('hex');
}

/**
 * Проверяет подпись от WEBPAY (для callback)
 */
export function verifyWebPaySignature(params: Record<string, string>): boolean {
  const { wsb_seed, wsb_order_num, wsb_test, wsb_currency_id, wsb_total, wsb_signature } = params;

  if (
    !wsb_seed ||
    !wsb_order_num ||
    !wsb_test ||
    !wsb_currency_id ||
    !wsb_total ||
    !wsb_signature
  ) {
    return false;
  }

  const expectedSignature = generateSignature(
    wsb_seed,
    wsb_order_num,
    wsb_test,
    wsb_currency_id,
    wsb_total
  );

  return expectedSignature === wsb_signature;
}

/**
 * Возвращает URL платежной страницы
 */
export function getPaymentUrl(): string {
  return PAYMENT_URL;
}

/**
 * Проверяет, используется ли тестовая среда
 */
export function isTestMode(): boolean {
  return IS_TEST;
}
