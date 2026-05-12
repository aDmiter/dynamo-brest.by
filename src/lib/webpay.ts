// src/lib/webpay.ts - Клиент для работы с WEBPAY SOAP API
import * as soap from 'soap';
import crypto from 'crypto';

const WSDL_URL = process.env.WEBPAY_WSDL_URL || 'https://sandbox.webpay.by/WSBApi2';
const STORE_ID = process.env.WEBPAY_STORE_ID || '584426783';
const LOGIN = process.env.WEBPAY_LOGIN || 'dynamo';
const PASSWORD = process.env.WEBPAY_PASSWORD || 'TUFbS4vO';
const SECRET_KEY = process.env.WEBPAY_SECRET_KEY || PASSWORD;

function getPasswordHash(): string {
  return crypto.createHash('md5').update(PASSWORD).digest('hex');
}

let clientPromise: Promise<soap.Client> | null = null;

async function getClient(): Promise<soap.Client> {
  if (!clientPromise) {
    clientPromise = soap.createClientAsync(WSDL_URL);
  }
  return clientPromise;
}

// ====================== СОЗДАНИЕ ПЛАТЕЖА ======================

export function getWebPayFormParams(
  orderNum: string,
  amount: number,
  description: string,
  returnUrl: string,
  cancelUrl: string,
  customerEmail?: string,
  customerName?: string
): Record<string, string> {
  const cleanOrderNum = orderNum.replace('#', '');
  const seed = Date.now().toString();

  const params: Record<string, string> = {
    wsb_storeid: STORE_ID,
    wsb_order_num: cleanOrderNum,
    wsb_currency_id: 'BYN',
    wsb_amount: amount.toFixed(2),
    wsb_seed: seed,
    wsb_test: '1',
    wsb_return_url: returnUrl,
    wsb_cancel_return_url: cancelUrl,
    wsb_version: '2',
  };

  if (customerEmail) params['wsb_email'] = customerEmail;
  if (customerName) params['wsb_customer_name'] = customerName;

  // Подпись: sha1(seed + store_id + order_num + test + currency_id + amount + secret_key)
  const signature = crypto
    .createHash('sha1')
    .update(seed + STORE_ID + cleanOrderNum + '1' + 'BYN' + amount.toFixed(2) + SECRET_KEY)
    .digest('hex');
  params['wsb_signature'] = signature;

  console.log('💳 WebPay form params:', params);

  return params;
}

// ====================== SOAP МЕТОДЫ ======================

export async function getTransactionStatus(
  orderNum: string
): Promise<TransactionStatusResponse | null> {
  try {
    const client = await getClient();
    const cleanOrderNum = orderNum.replace('#', '');
    const params = {
      store_id: STORE_ID,
      login: LOGIN,
      password: getPasswordHash(),
      order_num: cleanOrderNum,
    };

    const result = await client.GetTransactionStatusAsync(params);
    return result?.[0] as TransactionStatusResponse | null;
  } catch (error) {
    console.error('❌ WebPay GetTransactionStatus error:', error);
    return null;
  }
}

export async function completeTransaction(
  transactionId: string,
  amount: number,
  currency: string = 'BYN'
): Promise<TransactionCompleteResponse | null> {
  try {
    const client = await getClient();
    const params = {
      store_id: STORE_ID,
      login: LOGIN,
      password: getPasswordHash(),
      transaction_id: transactionId,
      amount,
      currency,
    };
    const result = await client.TransactionCompleteAsync(params);
    return result?.[0] as TransactionCompleteResponse | null;
  } catch (error) {
    console.error('❌ WebPay TransactionComplete error:', error);
    return null;
  }
}

export async function cancelTransaction(
  transactionId: string,
  amount: number,
  reason?: string
): Promise<TransactionCancelResponse | null> {
  try {
    const client = await getClient();
    const params = {
      store_id: STORE_ID,
      login: LOGIN,
      password: getPasswordHash(),
      transaction_id: transactionId,
      amount,
      currency: 'BYN',
      cancel_reason: reason || '',
    };
    const result = await client.TransactionCancelAsync(params);
    return result?.[0] as TransactionCancelResponse | null;
  } catch (error) {
    console.error('❌ WebPay TransactionCancel error:', error);
    return null;
  }
}

export async function refundTransaction(
  transactionId: string,
  amount: number,
  reason?: string
): Promise<TransactionRefundResponse | null> {
  try {
    const client = await getClient();
    const params = {
      store_id: STORE_ID,
      login: LOGIN,
      password: getPasswordHash(),
      transaction_id: transactionId,
      amount,
      currency: 'BYN',
      refund_reason: reason || '',
    };
    const result = await client.TransactionRefundAsync(params);
    return result?.[0] as TransactionRefundResponse | null;
  } catch (error) {
    console.error('❌ WebPay TransactionRefund error:', error);
    return null;
  }
}

// ====================== ТИПЫ ======================

export interface TransactionStatusResponse {
  transactions?: {
    transaction?: TransactionStatusStruct | TransactionStatusStruct[];
  };
  error_code?: string;
  error_comment?: string;
}

export interface TransactionStatusStruct {
  order_num?: string;
  transaction_id?: string;
  date?: string;
  status?: string;
  amount?: string;
  currency?: string;
  response_code?: string;
  response_text?: string;
  approval_code?: string;
  card_type?: string;
  card_number?: string;
  card_country?: string;
  payer_name?: string;
  payer_email?: string;
  payer_ip?: string;
  payment_type?: string;
  comment?: string;
}

export interface TransactionCompleteResponse {
  transaction_id?: string;
  error_code?: string;
  error_comment?: string;
}

export interface TransactionCancelResponse {
  transaction_id?: string;
  error_code?: string;
  error_comment?: string;
}

export interface TransactionRefundResponse {
  transaction_id?: string;
  error_code?: string;
  error_comment?: string;
}
