// src/app/api/webpay/callback/route.ts - Callback от WebPay после оплаты
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebPaySignature } from '@/lib/webpay';
import { sendOrderEmails } from '@/lib/mailer';

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

    // Проверяем подпись
    if (!verifyWebPaySignature(params)) {
      console.error('❌ Invalid signature in WebPay callback');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    return await updateOrderStatus(orderNum);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ WebPay callback error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET — для ручного обновления статуса при возврате с WebPay
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderNum = searchParams.get('wsb_order_num');

  console.log('📞 WebPay manual callback GET:', orderNum);

  if (!orderNum) {
    return NextResponse.json({ error: 'order_num is required' }, { status: 400 });
  }

  return await updateOrderStatus(orderNum);
}

async function updateOrderStatus(orderNum: string) {
  // Ищем заказ
  const order = await prisma.order.findFirst({
    where: { orderNumber: orderNum },
    include: { orderitem: { include: { product: true } } },
  });

  if (!order) {
    console.error('❌ Заказ не найден:', orderNum);
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Обновляем статус на "paid"
  if (order.status !== 'paid') {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'paid' },
    });

    // Отправляем письма
    const orderForEmail = {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      address: order.address,
      status: 'paid',
      trackingCode: order.trackingCode,
      total: Number(order.total),
      deliveryPrice: order.deliveryPrice ? Number(order.deliveryPrice) : null,
      orderitem: order.orderitem.map((item) => ({
        quantity: item.quantity,
        price: Number(item.price),
        size: item.size,
        product: { name: item.product.name },
      })),
    };

    try {
      await sendOrderEmails(orderForEmail, 'paid');
    } catch (e) {
      console.error('Ошибка отправки письма:', e);
    }

    console.log(`✅ Заказ ${orderNum}: статус изменён на paid`);
  }

  return NextResponse.json({ success: true, status: 'paid' });
}
