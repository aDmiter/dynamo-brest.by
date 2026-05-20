import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type StockLineItem = {
  productId: string;
  quantity: number;
  size?: string | null;
};

export type StockAvailability = {
  productId: string;
  size: string | null;
  requested: number;
  available: number;
  ok: boolean;
  productName: string;
  inStock: boolean;
};

export class InsufficientStockError extends Error {
  readonly issues: StockAvailability[];

  constructor(issues: StockAvailability[]) {
    const names = issues
      .filter((i) => !i.ok)
      .map((i) => `${i.productName}${i.size ? ` (${i.size})` : ''}: доступно ${i.available} шт.`)
      .join('; ');
    super(names ? `Недостаточно товара на складе: ${names}` : 'Недостаточно товара на складе');
    this.name = 'InsufficientStockError';
    this.issues = issues;
  }
}

export function mergeStockLines(items: StockLineItem[]): StockLineItem[] {
  const map = new Map<string, StockLineItem>();

  for (const item of items) {
    const size = item.size ?? null;
    const key = `${item.productId}\0${size ?? ''}`;
    const existing = map.get(key);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      map.set(key, { productId: item.productId, quantity: item.quantity, size });
    }
  }

  return Array.from(map.values());
}

type Tx = Prisma.TransactionClient;

export async function checkStockAvailability(
  items: StockLineItem[],
  tx: Tx | typeof prisma = prisma
): Promise<StockAvailability[]> {
  const merged = mergeStockLines(items);
  const result: StockAvailability[] = [];

  for (const item of merged) {
    const product = await tx.product.findUnique({
      where: { id: item.productId },
      select: { name: true, inStock: true, quantity: true, useSizes: true },
    });

    if (!product) {
      result.push({
        productId: item.productId,
        size: item.size ?? null,
        requested: item.quantity,
        available: 0,
        ok: false,
        productName: 'Товар',
        inStock: false,
      });
      continue;
    }

    let available = 0;

    if (item.size) {
      const productSize = await tx.productSize.findUnique({
        where: { productId_size: { productId: item.productId, size: item.size } },
        select: { quantity: true },
      });
      available = productSize?.quantity ?? 0;
    } else if (product.useSizes) {
      available = 0;
    } else {
      available = product.inStock ? product.quantity : 0;
    }

    result.push({
      productId: item.productId,
      size: item.size ?? null,
      requested: item.quantity,
      available,
      ok: available >= item.quantity,
      productName: product.name,
      inStock: product.inStock,
    });
  }

  return result;
}

export async function assertStockAvailable(items: StockLineItem[], tx?: Tx): Promise<void> {
  const availability = await checkStockAvailability(items, tx);
  const issues = availability.filter((a) => !a.ok);
  if (issues.length > 0) {
    throw new InsufficientStockError(availability);
  }
}

export async function reserveStock(items: StockLineItem[], tx: Tx): Promise<void> {
  const merged = mergeStockLines(items);
  await assertStockAvailable(merged, tx);

  for (const item of merged) {
    if (item.size) {
      const updated = await tx.productSize.updateMany({
        where: {
          productId: item.productId,
          size: item.size,
          quantity: { gte: item.quantity },
        },
        data: { quantity: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        const availability = await checkStockAvailability([item], tx);
        throw new InsufficientStockError(availability);
      }
    } else {
      const updated = await tx.product.updateMany({
        where: {
          id: item.productId,
          inStock: true,
          quantity: { gte: item.quantity },
        },
        data: { quantity: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        const availability = await checkStockAvailability([item], tx);
        throw new InsufficientStockError(availability);
      }
    }
  }
}

export async function releaseStock(items: StockLineItem[], tx: Tx): Promise<void> {
  const merged = mergeStockLines(items);

  for (const item of merged) {
    if (item.size) {
      await tx.productSize.updateMany({
        where: { productId: item.productId, size: item.size },
        data: { quantity: { increment: item.quantity } },
      });
    } else {
      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { increment: item.quantity } },
      });
    }
  }
}

export async function releaseOrderStock(orderId: string, tx?: Tx): Promise<void> {
  const client = tx ?? prisma;
  const items = await client.orderitem.findMany({
    where: { orderId },
    select: { productId: true, quantity: true, size: true },
  });

  const lines: StockLineItem[] = items.map((i) => ({
    productId: i.productId,
    quantity: i.quantity,
    size: i.size,
  }));

  if (tx) {
    await releaseStock(lines, tx);
  } else {
    await prisma.$transaction(async (inner) => releaseStock(lines, inner));
  }
}

export async function incrementOrderTotalSold(orderId: string, tx: Tx): Promise<void> {
  const items = await tx.orderitem.findMany({
    where: { orderId },
    select: { productId: true, quantity: true },
  });

  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { totalSold: { increment: item.quantity } },
    });
  }
}

/** Максимальное количество для позиции корзины с учётом других строк того же товара/размера. */
export function maxQuantityForCartLine(
  item: StockLineItem,
  cart: StockLineItem[],
  availability: StockAvailability[]
): number {
  const size = item.size ?? null;
  const row = availability.find(
    (a) => a.productId === item.productId && (a.size ?? null) === size
  );
  const available = row?.available ?? 0;
  const totalSame = cart
    .filter((c) => c.productId === item.productId && (c.size ?? null) === size)
    .reduce((sum, c) => sum + c.quantity, 0);
  const others = totalSame - item.quantity;
  return Math.max(0, available - others);
}
