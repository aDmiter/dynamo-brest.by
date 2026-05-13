// src/app/api/webpay/create-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getWebPayFormParams } from '@/lib/webpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, description, customerEmail, customerName, customerPhone } = body;

    if (!orderId || !amount) {
      return NextResponse.json({ error: 'orderId and amount are required' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const cleanOrderId = orderId.replace('#', '');
    const returnUrl = `${baseUrl}/shop/checkout/success?orderId=${cleanOrderId}`;
    const cancelUrl = `${baseUrl}/shop/checkout?orderId=${cleanOrderId}&cancelled=1`;

    const params = getWebPayFormParams({
      orderNum: orderId,
      amount,
      description: description || `Заказ ${orderId}`,
      returnUrl,
      cancelUrl,
      customerEmail,
      customerName,
      customerPhone,
    });

    return NextResponse.json({
      success: true,
      params,
      paymentUrl: 'https://securesandbox.webpay.by', // тестовая среда
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ WebPay create payment error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
