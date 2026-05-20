import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  BEPAID_IS_TEST,
  extractBePaidWebhookTrackingId,
  isBePaidWebhookSuccessful,
  validateBePaidWebhookAmount,
  verifyBePaidWebhookSignature,
  type BePaidWebhookPayload,
} from '@/lib/bepaid';
import { fulfillOrderPayment, orderNumberLookupValues } from '@/lib/shop-order-fulfillment';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('Content-Signature');

    if (!verifyBePaidWebhookSignature(rawBody, signature)) {
      console.error('❌ bePaid webhook: неверная подпись');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const payload = JSON.parse(rawBody) as BePaidWebhookPayload;

    if (!isBePaidWebhookSuccessful(payload)) {
      return NextResponse.json({ received: true, skipped: true });
    }

    const trackingId = extractBePaidWebhookTrackingId(payload);
    if (!trackingId) {
      return NextResponse.json({ error: 'tracking_id missing' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { orderNumber: { in: orderNumberLookupValues(trackingId) } },
    });

    if (!order) {
      console.error('❌ bePaid webhook: заказ не найден', trackingId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!validateBePaidWebhookAmount(payload, Number(order.total), BEPAID_IS_TEST)) {
      console.error('❌ bePaid webhook: сумма/валюта/test не совпадают', trackingId);
      return NextResponse.json({ error: 'Amount validation failed' }, { status: 400 });
    }

    const result = await fulfillOrderPayment(trackingId);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ bePaid webhook:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
