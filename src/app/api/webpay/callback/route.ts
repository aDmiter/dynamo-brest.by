// src/app/api/webpay/callback/route.ts - Callback от WebPay после оплаты
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTransactionStatus } from '@/lib/webpay';
import { sendOrderEmails } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const orderNum = formData.get('order_num') as string;
    const transactionId = formData.get('transaction_id') as string;
    const status = formData.get('status') as string;

    console.log('📞 WebPay callback:', { orderNum, transactionId, status });

    if (!orderNum) {
      return NextResponse.json({ error: 'order_num is required' }, { status: 400 });
    }

    // Ищем заказ по orderNumber (у нас orderNumber = orderNum)
    const order = await prisma.order.findFirst({
      where: { orderNumber: orderNum },
      include: { orderitem: { include: { product: true } } },
    });

    if (!order) {
      console.error('❌ Заказ не найден:', orderNum);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Проверяем статус через API
    const wsStatus = await getTransactionStatus(orderNum);

    if (wsStatus && wsStatus.transactions?.transaction) {
      const tx = Array.isArray(wsStatus.transactions.transaction)
        ? wsStatus.transactions.transaction[0]
        : wsStatus.transactions.transaction;

      const newStatus =
        tx.status === 'Authorized' || tx.status === 'Completed'
          ? 'paid'
          : tx.status === 'Failed'
            ? 'cancelled'
            : order.status;

      if (newStatus !== order.status) {
        await prisma.order.update({
          where: { id: order.id },
          data: { status: newStatus },
        });

        // Отправляем письма при успешной оплате
        if (newStatus === 'paid') {
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
        }

        console.log(`✅ Заказ ${orderNum}: ${order.status} → ${newStatus}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ WebPay callback error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// WebPay может отправлять callback через GET тоже
export async function GET(request: NextRequest) {
  return POST(request);
}
