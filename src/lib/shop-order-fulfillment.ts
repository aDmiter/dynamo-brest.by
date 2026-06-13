import { prisma } from '@/lib/prisma';
import { sendOrderEmails } from '@/lib/mailer';
import { isPaidOrderStatus, isUnpaidOrderStatus } from '@/lib/order-status';
import {
  incrementOrderTotalSold,
  reserveStock,
  type StockLineItem,
} from '@/lib/shop-stock';

export function normalizeOrderNumber(value: string): string {
  const clean = value.replace(/^#/, '');
  return `#${clean}`;
}

export function orderNumberLookupValues(value: string): string[] {
  const clean = value.replace(/^#/, '');
  return [`#${clean}`, clean];
}

/** Списание для заказов до резервирования при создании (legacy). */
async function decrementOrderStock(orderId: string): Promise<void> {
  const items = await prisma.orderitem.findMany({
    where: { orderId },
    include: { product: true },
  });

  for (const item of items) {
    if (item.size) {
      const productSize = await prisma.productSize.findFirst({
        where: { productId: item.productId, size: item.size },
      });
      if (productSize) {
        await prisma.productSize.update({
          where: { id: productSize.id },
          data: { quantity: { decrement: item.quantity } },
        });
      }
    } else {
      await prisma.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    await prisma.product.update({
      where: { id: item.productId },
      data: { totalSold: { increment: item.quantity } },
    });
  }
}

/** Подтверждение оплаты: статус paid, учёт продаж, письма. Остатки уже зарезервированы при создании заказа. */
export async function fulfillOrderPayment(orderNumber: string): Promise<{
  success: boolean;
  status?: string;
  error?: string;
}> {
  const variants = orderNumberLookupValues(orderNumber);

  const order = await prisma.order.findFirst({
    where: { orderNumber: { in: variants } },
    include: { orderitem: { include: { product: true } } },
  });

  if (!order) {
    return { success: false, error: 'Order not found' };
  }

  const alreadyPaid = isPaidOrderStatus(order.status);

  if (order.status === 'cancelled') {
    const stockLines: StockLineItem[] = order.orderitem.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      size: item.size,
    }));

    try {
      await prisma.$transaction(async (tx) => {
        await reserveStock(stockLines, tx);
        await tx.order.update({
          where: { id: order.id },
          data: { status: 'paid', stockReserved: true },
        });
        await incrementOrderTotalSold(order.id, tx);
      });
      try {
        await sendOrderEmails(order, 'paid');
      } catch (e) {
        console.error('Ошибка отправки письма после оплаты:', e);
      }
      return { success: true, status: 'paid' };
    } catch {
      return { success: false, error: 'Заказ отменён, товар недоступен' };
    }
  }

  const wasPending = isUnpaidOrderStatus(order.status);

  if (!alreadyPaid) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'paid' },
    });

    if (wasPending && !order.stockReserved) {
      await decrementOrderStock(order.id);
    } else if (order.stockReserved) {
      await prisma.$transaction(async (tx) => {
        await incrementOrderTotalSold(order.id, tx);
      });
    }
  }

  if (!alreadyPaid) {
    try {
      await sendOrderEmails(order, 'paid');
    } catch (e) {
      console.error('Ошибка отправки письма после оплаты:', e);
    }
  }

  return { success: true, status: 'paid' };
}
