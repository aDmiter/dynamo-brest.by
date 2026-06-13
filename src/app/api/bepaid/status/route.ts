import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getBePaidCheckoutStatus } from '@/lib/bepaid';
import { isBePaidMockToken } from '@/config/bepaid-public';
import { isPaidOrderStatus } from '@/lib/order-status';
import { fulfillOrderPayment, orderNumberLookupValues } from '@/lib/shop-order-fulfillment';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderNum = searchParams.get('orderNum');
  const token = searchParams.get('token');

  if (!orderNum) {
    return NextResponse.json({ error: 'orderNum is required' }, { status: 400 });
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNum.startsWith('#') ? orderNum : `#${orderNum.replace(/^#/, '')}`,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (isPaidOrderStatus(order.status)) {
      return NextResponse.json({
        success: true,
        orderStatus: order.status,
        isPaid: true,
        message: 'Заказ оплачен',
      });
    }

    if (token && !isBePaidMockToken(token)) {
      const checkout = await getBePaidCheckoutStatus(token);
      const trackingMatches =
        checkout.trackingId &&
        order.orderNumber &&
        orderNumberLookupValues(checkout.trackingId).some((id) =>
          orderNumberLookupValues(order.orderNumber!).includes(id)
        );

      if (checkout.finished && checkout.status === 'successful' && trackingMatches) {
        await fulfillOrderPayment(order.orderNumber);
        return NextResponse.json({
          success: true,
          orderStatus: 'paid',
          isPaid: true,
          message: 'Заказ оплачен',
        });
      }
    }

    return NextResponse.json({
      success: true,
      orderStatus: order.status,
      isPaid: false,
      message: 'Ожидает оплаты',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
