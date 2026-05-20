import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bynToMinorUnits, createBePaidCheckoutToken } from '@/lib/bepaid';
import { createBePaidMockToken, isBePaidMockMode } from '@/lib/bepaid-config';
import { normalizeOrderNumber } from '@/lib/shop-order-fulfillment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, total, customerEmail, customerName, customerAddress, customerPhone } =
      body as {
        orderId?: string;
        total?: number;
        customerEmail?: string;
        customerName?: string;
        customerAddress?: string;
        customerPhone?: string;
      };

    if (!orderId || total === undefined || total === null) {
      return NextResponse.json({ error: 'orderId и total обязательны' }, { status: 400 });
    }

    const trackingId = normalizeOrderNumber(String(orderId));
    const order = await prisma.order.findFirst({
      where: { orderNumber: trackingId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    if (Number(order.total) !== Number(total)) {
      return NextResponse.json({ error: 'Сумма заказа не совпадает' }, { status: 400 });
    }

    if (!isBePaidMockMode() && !process.env.BEPAID_SHOP_ID?.trim()) {
      return NextResponse.json(
        {
          error:
            'Укажите BEPAID_SHOP_ID в .env.local (ID магазина в ЛК bePaid → Магазины → Подробнее)',
        },
        { status: 503 }
      );
    }

    if (isBePaidMockMode()) {
      const token = createBePaidMockToken(trackingId);
      return NextResponse.json({
        success: true,
        token,
        mock: true,
        checkoutUrl: 'https://checkout.bepaid.by',
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const orderIdClean = trackingId.replace(/^#/, '');
    const successUrl = `${baseUrl}/shop/checkout/success?orderId=${encodeURIComponent(orderIdClean)}`;
    const failUrl = `${baseUrl}/shop/checkout?orderId=${encodeURIComponent(orderIdClean)}&cancelled=1`;

    const { token, redirectUrl } = await createBePaidCheckoutToken({
      trackingId,
      amountMinor: bynToMinorUnits(Number(total)),
      description: `Заказ ${trackingId}`,
      notificationUrl: `${baseUrl}/api/bepaid/webhook`,
      successUrl,
      failUrl,
      declineUrl: failUrl,
      cancelUrl: failUrl,
      customer: {
        email: customerEmail,
        name: customerName,
        address: customerAddress,
        phone: customerPhone,
      },
    });

    return NextResponse.json({
      success: true,
      token,
      redirectUrl,
      mock: false,
      checkoutUrl: 'https://checkout.bepaid.by',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ bePaid create-checkout:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
