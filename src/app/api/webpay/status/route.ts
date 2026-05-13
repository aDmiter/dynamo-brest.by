// src/app/api/webpay/status/route.ts - Проверка статуса заказа
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderNum = searchParams.get('orderNum');

  console.log('📡 [STATUS] Проверка статуса заказа:', orderNum);

  if (!orderNum) {
    return NextResponse.json({ error: 'orderNum is required' }, { status: 400 });
  }

  try {
    const order = await prisma.order.findFirst({
      where: { orderNumber: orderNum },
    });

    console.log('📡 [STATUS] Заказ найден:', order ? 'да' : 'нет');

    if (order) {
      console.log('📡 [STATUS] Статус заказа:', order.status);
    }

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      orderStatus: order.status,
      isPaid: order.status === 'paid' || order.status === 'received',
      message: order.status === 'paid' ? 'Заказ оплачен' : 'Ожидает оплаты',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ [STATUS] Ошибка:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
