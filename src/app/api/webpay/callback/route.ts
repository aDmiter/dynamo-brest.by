// src/app/api/webpay/callback/route.ts - Callback от WebPay после оплаты
import { NextRequest, NextResponse } from 'next/server';
import { verifyWebPaySignature } from '@/lib/webpay';
import { fulfillOrderPayment } from '@/lib/shop-order-fulfillment';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const params: Record<string, string> = {};

    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    console.log('📞 WebPay callback:', params);

    const orderNum = params.wsb_order_num;

    if (!orderNum) {
      return NextResponse.json({ error: 'order_num is required' }, { status: 400 });
    }

    if (!verifyWebPaySignature(params)) {
      console.error('❌ Invalid signature in WebPay callback');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    return await handlePaidOrder(orderNum);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ WebPay callback error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderNum = searchParams.get('wsb_order_num');

  if (!orderNum) {
    return NextResponse.json({ error: 'order_num is required' }, { status: 400 });
  }

  return await handlePaidOrder(orderNum);
}

async function handlePaidOrder(orderNum: string) {
  const result = await fulfillOrderPayment(orderNum);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ success: true, status: 'paid' });
}
