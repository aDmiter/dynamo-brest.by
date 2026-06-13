import { prisma } from '@/lib/prisma';
import {
  UNPAID_ORDER_PAYMENT_TTL_MS,
  UNPAID_ORDER_PAYMENT_TTL_MINUTES,
} from '@/config/shop-order-payment';
import { isUnpaidOrderStatus } from '@/lib/order-status';
import { releaseOrderStock } from '@/lib/shop-stock';

export { UNPAID_ORDER_PAYMENT_TTL_MINUTES, UNPAID_ORDER_PAYMENT_TTL_MS };

export function getUnpaidOrderExpiresAt(createdAt: Date): Date {
  return new Date(createdAt.getTime() + UNPAID_ORDER_PAYMENT_TTL_MS);
}

export function getUnpaidOrderRemainingSeconds(createdAt: Date, now = new Date()): number {
  const expiresAt = getUnpaidOrderExpiresAt(createdAt);
  return Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / 1000));
}

export function isUnpaidOrderExpired(createdAt: Date, now = new Date()): boolean {
  return getUnpaidOrderRemainingSeconds(createdAt, now) <= 0;
}

export type OrderPaymentStatusResult = {
  status: string;
  expired: boolean;
  cancelled: boolean;
  expiresAt: string;
  remainingSeconds: number;
  orderNumber?: string;
};

type UnpaidOrderRow = {
  id: string;
  status: string;
  stockReserved: boolean;
};

async function cancelUnpaidOrder(order: UnpaidOrderRow): Promise<void> {
  await prisma.$transaction(async (tx) => {
    if (order.stockReserved) {
      await releaseOrderStock(order.id, tx);
    }
    await tx.order.update({
      where: { id: order.id },
      data: { status: 'cancelled', stockReserved: false },
    });
  });
}

export async function expireUnpaidOrderIfNeeded(orderId: string): Promise<OrderPaymentStatusResult | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      createdAt: true,
      stockReserved: true,
    },
  });

  if (!order) return null;

  const expiresAt = getUnpaidOrderExpiresAt(order.createdAt);
  const remainingSeconds = getUnpaidOrderRemainingSeconds(order.createdAt);

  if (!isUnpaidOrderStatus(order.status)) {
    return {
      status: order.status,
      expired: order.status === 'cancelled',
      cancelled: order.status === 'cancelled',
      expiresAt: expiresAt.toISOString(),
      remainingSeconds: 0,
      orderNumber: order.orderNumber,
    };
  }

  if (remainingSeconds > 0) {
    return {
      status: order.status,
      expired: false,
      cancelled: false,
      expiresAt: expiresAt.toISOString(),
      remainingSeconds,
      orderNumber: order.orderNumber,
    };
  }

  await cancelUnpaidOrder(order);

  return {
    status: 'cancelled',
    expired: true,
    cancelled: true,
    expiresAt: expiresAt.toISOString(),
    remainingSeconds: 0,
    orderNumber: order.orderNumber,
  };
}

export async function rejectIfUnpaidOrderExpired(order: {
  id: string;
  status: string;
  createdAt: Date;
}): Promise<boolean> {
  if (!isUnpaidOrderStatus(order.status)) return false;
  if (!isUnpaidOrderExpired(order.createdAt)) return false;
  await expireUnpaidOrderIfNeeded(order.id);
  return true;
}

export async function cancelExpiredUnpaidOrders(): Promise<{
  checked: number;
  cancelled: number;
  errors: number;
  durationSeconds: number;
}> {
  const started = Date.now();
  const cutoff = new Date(Date.now() - UNPAID_ORDER_PAYMENT_TTL_MS);

  const orders = await prisma.order.findMany({
    where: {
      status: { in: ['unpaid', 'pending_payment'] },
      createdAt: { lt: cutoff },
    },
    select: { id: true, status: true, stockReserved: true },
  });

  let cancelled = 0;
  let errors = 0;

  for (const order of orders) {
    try {
      await cancelUnpaidOrder(order);
      cancelled++;
    } catch (error) {
      errors++;
      console.error(`[shop-order-expiry] Не удалось отменить заказ ${order.id}:`, error);
    }
  }

  return {
    checked: orders.length,
    cancelled,
    errors,
    durationSeconds: Math.round((Date.now() - started) / 1000),
  };
}
