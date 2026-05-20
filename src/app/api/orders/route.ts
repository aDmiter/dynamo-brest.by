// src/app/api/orders/route.ts - API заказов
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderEmails } from '@/lib/mailer';
import {
  InsufficientStockError,
  reserveStock,
  type StockLineItem,
} from '@/lib/shop-stock';

type OrderItemInput = {
  productId: string;
  quantity: number;
  price: number;
  size?: string | null;
  customization?: Record<string, unknown> | null;
};

function toStockLines(items: OrderItemInput[]): StockLineItem[] {
  return items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    size: item.size ?? null,
  }));
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const items = (data.items ?? []) as OrderItemInput[];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Корзина пуста' }, { status: 400 });
    }

    const today = new Date();
    const datePrefix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

    const todayOrders = await prisma.order.count({
      where: {
        createdAt: { gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()) },
      },
    });

    const orderNumber = `#${datePrefix}-${String(todayOrders + 1).padStart(3, '0')}`;
    const shouldReserveStock = !data.skipStockUpdate;
    const stockLines = toStockLines(items);

    const orderData = {
      orderNumber,
      customerName: data.customerName,
      customerEmail: data.customerEmail || null,
      customerPhone: data.customerPhone || '',
      address: data.address || null,
      comment: data.comment || null,
      deliveryPrice: data.deliveryPrice || 0,
      status: data.status || 'received',
      total: Number(data.total),
      stockReserved: shouldReserveStock,
      orderitem: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          size: item.size || null,
          customization: item.customization ? JSON.stringify(item.customization) : null,
        })),
      },
    };

    const order = shouldReserveStock
      ? await prisma.$transaction(async (tx) => {
          await reserveStock(stockLines, tx);
          return tx.order.create({
            data: orderData,
            include: { orderitem: { include: { product: true } } },
          });
        })
      : await prisma.order.create({
          data: orderData,
          include: { orderitem: { include: { product: true } } },
        });

    if (data.status !== 'pending_payment') {
      try {
        await sendOrderEmails(order);
      } catch (err) {
        console.error('❌ Ошибка в sendOrderEmails:', err);
      }
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof InsufficientStockError) {
      return NextResponse.json(
        { error: error.message, issues: error.issues.filter((i) => !i.ok) },
        { status: 409 }
      );
    }
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
