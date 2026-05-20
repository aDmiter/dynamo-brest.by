import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isBePaidMockMode, parseBePaidMockToken } from '@/lib/bepaid-config';
import { fulfillOrderPayment, normalizeOrderNumber } from '@/lib/shop-order-fulfillment';

export async function POST(request: NextRequest) {
  if (!isBePaidMockMode()) {
    return NextResponse.json({ error: 'Mock-режим отключён' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { token, orderId, success } = body as {
      token?: string;
      orderId?: string;
      success?: boolean;
    };

    if (success !== true && success !== false) {
      return NextResponse.json({ error: 'success (boolean) обязателен' }, { status: 400 });
    }

    let trackingId = orderId ? normalizeOrderNumber(String(orderId)) : null;
    if (token) {
      const fromToken = parseBePaidMockToken(token);
      if (!fromToken) {
        return NextResponse.json({ error: 'Некорректный mock-токен' }, { status: 400 });
      }
      trackingId = normalizeOrderNumber(fromToken);
    }

    if (!trackingId) {
      return NextResponse.json({ error: 'orderId или token обязателен' }, { status: 400 });
    }

    if (!success) {
      return NextResponse.json({ success: true, status: 'failed' });
    }

    const order = await prisma.order.findFirst({
      where: { orderNumber: trackingId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    const result = await fulfillOrderPayment(trackingId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true, status: 'paid', mock: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
