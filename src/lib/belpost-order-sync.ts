import { fetchBelpostTracking } from '@/lib/belpost-tracking';
import { sendOrderEmails } from '@/lib/mailer';
import { prisma } from '@/lib/prisma';

const REQUEST_DELAY_MS = 400;

export interface BelpostOrderSyncItem {
  orderId: string;
  orderNumber: string;
  trackingCode: string;
  action: 'delivered' | 'unchanged' | 'skipped' | 'error';
  latestEvent?: string | null;
  error?: string;
}

export interface BelpostOrderSyncResult {
  checked: number;
  delivered: number;
  unchanged: number;
  errors: number;
  items: BelpostOrderSyncItem[];
  durationSeconds: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function syncShippedOrdersFromBelpost(): Promise<BelpostOrderSyncResult> {
  const startTime = Date.now();
  const orders = await prisma.order.findMany({
    where: {
      status: 'shipped',
      trackingCode: { not: null },
      NOT: { trackingCode: '' },
    },
    include: { orderitem: { include: { product: true } } },
    orderBy: { createdAt: 'asc' },
  });

  const items: BelpostOrderSyncItem[] = [];
  let delivered = 0;
  let unchanged = 0;
  let errors = 0;

  for (let i = 0; i < orders.length; i++) {
    const order = orders[i];
    const trackingCode = order.trackingCode?.trim() ?? '';

    if (!trackingCode) {
      items.push({
        orderId: order.id,
        orderNumber: order.orderNumber ?? order.id,
        trackingCode,
        action: 'skipped',
        error: 'Нет кода отслеживания',
      });
      continue;
    }

    try {
      const tracking = await fetchBelpostTracking(trackingCode);

      if (tracking.isDelivered) {
        const updated = await prisma.order.update({
          where: { id: order.id },
          data: { status: 'delivered' },
          include: { orderitem: { include: { product: true } } },
        });
        await sendOrderEmails(updated, 'delivered');
        delivered++;
        items.push({
          orderId: order.id,
          orderNumber: order.orderNumber ?? order.id,
          trackingCode,
          action: 'delivered',
          latestEvent: tracking.latestEvent,
        });
      } else {
        unchanged++;
        items.push({
          orderId: order.id,
          orderNumber: order.orderNumber ?? order.id,
          trackingCode,
          action: 'unchanged',
          latestEvent: tracking.latestEvent,
        });
      }
    } catch (error) {
      errors++;
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
      items.push({
        orderId: order.id,
        orderNumber: order.orderNumber ?? order.id,
        trackingCode,
        action: 'error',
        error: message,
      });
      console.error(`[Belpost] Заказ №${order.orderNumber} (${trackingCode}): ${message}`);
    }

    if (i < orders.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  return {
    checked: orders.length,
    delivered,
    unchanged,
    errors,
    items,
    durationSeconds: ((Date.now() - startTime) / 1000).toFixed(1),
  };
}
