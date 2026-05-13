// src/lib/webpay.ts - Клиент для работы с WEBPAY (прямая форма + SOAP API)
import crypto from 'crypto';

// ====================== КОНФИГУРАЦИЯ ======================

const STORE_ID = process.env.WEBPAY_STORE_ID || '584426783';
const SECRET_KEY = process.env.WEBPAY_SECRET_KEY || 'dynamo-brest-secret-key-2024';
const IS_TEST = process.env.NODE_ENV === 'development' || process.env.WEBPAY_TEST === '1';

const PAYMENT_URL = IS_TEST ? 'https://securesandbox.webpay.by' : 'https://payment.webpay.by';

const BILLING_URL = IS_TEST ? 'https://sandbox.webpay.by' : 'https://billing.webpay.by';

// SOAP WSDL для проверки статуса
const WSDL_URL = IS_TEST
  ? 'https://sandbox.webpay.by/WSBApi2'
  : 'https://billing.webpay.by/WSBApi2';

// ====================== ФОРМИРОВАНИЕ ПЛАТЕЖНОЙ ФОРМЫ ======================

/**
 * Генерирует параметры для POST-формы перенаправления на WEBPAY
 */
export function getWebPayFormParams(params: {
  orderNum: string;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
}): Record<string, string> {
  const {
    orderNum,
    amount,
    description,
    returnUrl,
    cancelUrl,
    customerEmail,
    customerName,
    customerPhone,
  } = params;

  // Очищаем номер заказа от #
  const cleanOrderNum = orderNum.replace('#', '');

  // Генерируем seed (случайная строка)
  const seed = Date.now().toString();

  const formParams: Record<string, string> = {
    '*scart': '',
    wsb_version: '2',
    wsb_storeid: STORE_ID,
    wsb_order_num: cleanOrderNum,
    wsb_currency_id: 'BYN',
    wsb_amount: amount.toFixed(2),
    wsb_seed: seed,
    wsb_test: IS_TEST ? '1' : '0',
    wsb_invoice_item_name: description,
    wsb_return_url: returnUrl,
    wsb_cancel_return_url: cancelUrl,
    wsb_notify_url: process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/webpay/callback`
      : 'http://localhost:3000/api/webpay/callback',
  };

  if (customerEmail) formParams.wsb_email = customerEmail;
  if (customerName) formParams.wsb_customer_name = customerName;
  if (customerPhone) formParams.wsb_phone = customerPhone;

  // Формируем подпись
  const signature = generateSignature(
    seed,
    cleanOrderNum,
    IS_TEST ? '1' : '0',
    'BYN',
    amount.toFixed(2)
  );

  formParams.wsb_signature = signature;

  console.log('💳 WebPay form params:', {
    storeId: STORE_ID,
    orderNum: cleanOrderNum,
    amount: amount.toFixed(2),
    seed,
    isTest: IS_TEST,
    signature: signature.substring(0, 10) + '...',
  });

  return formParams;
}

/**
 * Генерирует цифровую подпись для формы оплаты
 * Формат: SHA1(seed + storeid + order_num + test + currency_id + amount + secret_key)
 */
function generateSignature(
  seed: string,
  orderNum: string,
  test: string,
  currencyId: string,
  amount: string
): string {
  const signatureString = seed + STORE_ID + orderNum + test + currencyId + amount + SECRET_KEY;
  return crypto.createHash('sha1').update(signatureString).digest('hex');
}

/**
 * Проверяет подпись от WEBPAY (для callback)
 */
export function verifyWebPaySignature(params: Record<string, string>): boolean {
  const { wsb_seed, wsb_order_num, wsb_test, wsb_currency_id, wsb_amount, wsb_signature } = params;

  if (
    !wsb_seed ||
    !wsb_order_num ||
    !wsb_test ||
    !wsb_currency_id ||
    !wsb_amount ||
    !wsb_signature
  ) {
    return false;
  }

  const expectedSignature = generateSignature(
    wsb_seed,
    wsb_order_num,
    wsb_test,
    wsb_currency_id,
    wsb_amount
  );

  return expectedSignature === wsb_signature;
}

// ====================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ======================

/**
 * Возвращает URL платежной страницы
 */
export function getPaymentUrl(): string {
  return PAYMENT_URL;
}

/**
 * Возвращает URL биллинга
 */
export function getBillingUrl(): string {
  return BILLING_URL;
}

/**
 * Проверяет, используется ли тестовая среда
 */
export function isTestMode(): boolean {
  return IS_TEST;
}
