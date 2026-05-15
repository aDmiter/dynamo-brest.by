// src/app/api/webpay/create-payment/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getWebPayFormParams } from '@/lib/webpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      orderId,
      items,
      total,
      deliveryPrice,
      customerEmail,
      customerName,
      customerPhone,
      customerAddress,
    } = body;

    if (!orderId || !items || !total) {
      return NextResponse.json({ error: 'orderId, items and total are required' }, { status: 400 });
    }

    // Если есть доставка — добавляем как товар
    const allItems = [...items];
    if (deliveryPrice && deliveryPrice > 0) {
      allItems.push({
        name: 'Доставка',
        quantity: 1,
        price: deliveryPrice,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const cleanOrderId = orderId.replace('#', '');
    const returnUrl = `${baseUrl}/shop/checkout/success?orderId=${cleanOrderId}`;
    const cancelUrl = `${baseUrl}/shop/checkout?orderId=${cleanOrderId}&cancelled=1`;

    const params = getWebPayFormParams({
      orderNum: orderId,
      items: allItems,
      total, // total уже включает доставку
      returnUrl,
      cancelUrl,
      customerEmail,
      customerName,
      customerPhone,
      customerAddress,
    });

    return NextResponse.json({
      success: true,
      params,
      paymentUrl: 'https://securesandbox.webpay.by',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ WebPay create payment error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
