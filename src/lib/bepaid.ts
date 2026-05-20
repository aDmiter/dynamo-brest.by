import crypto from 'crypto';

import { BEPAID_CHECKOUT_URL } from '@/config/bepaid-public';

const CHECKOUT_API = `${BEPAID_CHECKOUT_URL}/ctp/api/checkouts`;

const SHOP_ID = process.env.BEPAID_SHOP_ID || '';
const SECRET_KEY = process.env.BEPAID_SECRET_KEY || '';
const PUBLIC_KEY = process.env.BEPAID_PUBLIC_KEY || '';

export const BEPAID_IS_TEST =
  process.env.BEPAID_TEST === '1' ||
  (process.env.NODE_ENV === 'development' && process.env.BEPAID_TEST !== '0');

export interface BePaidCheckoutCustomer {
  email?: string;
  name?: string;
  address?: string;
  phone?: string;
}

export interface CreateBePaidCheckoutParams {
  trackingId: string;
  amountMinor: number;
  description: string;
  notificationUrl: string;
  successUrl: string;
  failUrl: string;
  declineUrl: string;
  cancelUrl: string;
  customer?: BePaidCheckoutCustomer;
}

export interface BePaidCheckoutTokenResult {
  token: string;
  redirectUrl: string;
}

function authHeader(): string {
  if (!SHOP_ID || !SECRET_KEY) {
    throw new Error('BEPAID_SHOP_ID и BEPAID_SECRET_KEY должны быть заданы в env');
  }
  const credentials = Buffer.from(`${SHOP_ID}:${SECRET_KEY}`).toString('base64');
  return `Basic ${credentials}`;
}

/** Сумма в BYN → копейки (минимальные единицы). */
export function bynToMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

export function minorUnitsToByn(amount: number): number {
  return amount / 100;
}

function splitCustomerName(fullName: string): { first_name: string; last_name: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first_name: '', last_name: '' };
  if (parts.length === 1) return { first_name: parts[0], last_name: '' };
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
}

export async function createBePaidCheckoutToken(
  params: CreateBePaidCheckoutParams
): Promise<BePaidCheckoutTokenResult> {
  const customer = params.customer ?? {};
  const nameParts = splitCustomerName(customer.name || '');

  const body = {
    checkout: {
      test: BEPAID_IS_TEST,
      transaction_type: 'payment',
      iframe: true,
      attempts: 3,
      settings: {
        language: 'ru',
        auto_return: 0,
        notification_url: params.notificationUrl,
        success_url: params.successUrl,
        fail_url: params.failUrl,
        decline_url: params.declineUrl,
        cancel_url: params.cancelUrl,
        customer_fields: {
          visible: ['email'],
          read_only: customer.email ? ['email'] : [],
        },
      },
      payment_method: {
        types: ['credit_card'],
      },
      order: {
        amount: params.amountMinor,
        currency: 'BYN',
        description: params.description,
        tracking_id: params.trackingId,
      },
      customer: {
        email: customer.email,
        first_name: nameParts.first_name || undefined,
        last_name: nameParts.last_name || undefined,
        address: customer.address,
        phone: customer.phone,
      },
    },
  };

  const res = await fetch(CHECKOUT_API, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-Version': '2',
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as {
    checkout?: { token?: string; redirect_url?: string };
    message?: string;
    errors?: unknown;
  };

  if (!res.ok || !data.checkout?.token) {
    const detail =
      data.message ||
      (typeof data.errors === 'object' ? JSON.stringify(data.errors) : 'Checkout token error');
    throw new Error(detail);
  }

  return {
    token: data.checkout.token,
    redirectUrl: data.checkout.redirect_url || `${BEPAID_CHECKOUT_URL}/v2/checkout?token=${data.checkout.token}`,
  };
}

export async function getBePaidCheckoutStatus(paymentToken: string): Promise<{
  status: string;
  finished: boolean;
  trackingId: string | null;
  amountMinor: number | null;
  currency: string | null;
  test: boolean;
}> {
  const res = await fetch(`${CHECKOUT_API}/${paymentToken}`, {
    method: 'GET',
    headers: {
      Authorization: authHeader(),
      Accept: 'application/json',
      'X-API-Version': '2',
    },
  });

  const data = (await res.json()) as {
    checkout?: {
      status?: string;
      finished?: boolean;
      test?: boolean;
      order?: { tracking_id?: string | null; amount?: number; currency?: string };
    };
  };

  if (!res.ok || !data.checkout) {
    throw new Error('Не удалось получить статус платежа bePaid');
  }

  const checkout = data.checkout;
  return {
    status: checkout.status || 'unknown',
    finished: Boolean(checkout.finished),
    trackingId: checkout.order?.tracking_id ?? null,
    amountMinor: checkout.order?.amount ?? null,
    currency: checkout.order?.currency ?? null,
    test: Boolean(checkout.test),
  };
}

/** RSA-SHA256, подпись в заголовке Content-Signature (base64). */
export function verifyBePaidWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!PUBLIC_KEY || !signatureHeader) {
    if (process.env.NODE_ENV === 'development' && process.env.BEPAID_SKIP_SIGNATURE === '1') {
      console.warn('⚠️ bePaid webhook: проверка подписи отключена (BEPAID_SKIP_SIGNATURE)');
      return true;
    }
    return false;
  }

  try {
    const publicKeyBody = PUBLIC_KEY.replace(/\r\n|\n/g, '');
    const pem = `-----BEGIN PUBLIC KEY-----\n${publicKeyBody.match(/.{1,64}/g)?.join('\n') ?? publicKeyBody}\n-----END PUBLIC KEY-----`;
    const key = crypto.createPublicKey(pem);
    const signature = Buffer.from(signatureHeader, 'base64');
    return crypto.verify('RSA-SHA256', Buffer.from(rawBody, 'utf8'), key, signature);
  } catch (e) {
    console.error('bePaid signature verification error:', e);
    return false;
  }
}

export interface BePaidWebhookPayload {
  transaction?: {
    status?: string;
    amount?: number;
    currency?: string;
    test?: boolean;
    tracking_id?: string;
  };
  gateway_response?: {
    payment?: { status?: string };
  };
  status?: string;
  test?: boolean;
  order?: {
    amount?: number;
    currency?: string;
    tracking_id?: string | null;
  };
}

export function extractBePaidWebhookTrackingId(payload: BePaidWebhookPayload): string | null {
  return (
    payload.transaction?.tracking_id ||
    payload.order?.tracking_id ||
    null
  );
}

export function isBePaidWebhookSuccessful(payload: BePaidWebhookPayload): boolean {
  if (payload.transaction?.status === 'successful') return true;
  if (payload.gateway_response?.payment?.status === 'successful') return true;
  if (payload.status === 'successful') return true;
  return false;
}

export function validateBePaidWebhookAmount(
  payload: BePaidWebhookPayload,
  expectedTotalByn: number,
  expectTest: boolean
): boolean {
  const amountMinor =
    payload.transaction?.amount ?? payload.order?.amount;
  const currency = payload.transaction?.currency ?? payload.order?.currency;
  const isTest = payload.transaction?.test ?? payload.test;

  if (amountMinor === undefined || !currency) return false;
  if (currency !== 'BYN') return false;
  if (Boolean(isTest) !== expectTest) return false;

  return amountMinor === bynToMinorUnits(expectedTotalByn);
}
