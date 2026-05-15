// src/app/api/orders/route.ts - API заказов
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderEmails } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const today = new Date();
    const datePrefix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

    const todayOrders = await prisma.order.count({
      where: {
        createdAt: { gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()) },
      },
    });

    const orderNumber = `#${datePrefix}-${String(todayOrders + 1).padStart(3, '0')}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: data.customerName,
        customerEmail: data.customerEmail || null,
        customerPhone: data.customerPhone || '',
        address: data.address || null,
        comment: data.comment || null,
        deliveryPrice: data.deliveryPrice || 0,
        status: data.status || 'received',
        total: Number(data.total),
        orderitem: {
          create: data.items.map(
            (item: {
              productId: string;
              quantity: number;
              price: number;
              size?: string | null;
              customization?: Record<string, unknown> | null;
            }) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              size: item.size || null,
              customization: item.customization ? JSON.stringify(item.customization) : null,
            })
          ),
        },
      },
      include: { orderitem: { include: { product: true } } },
    });

    // Списываем остатки и увеличиваем счётчик продаж только если не skipStockUpdate
    if (!data.skipStockUpdate && data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
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

    // Отправляем письма только если заказ не pending_payment
    if (data.status !== 'pending_payment') {
      const orderForEmail = {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        address: order.address,
        status: order.status,
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
        await sendOrderEmails(orderForEmail);
      } catch (err) {
        console.error('❌ Ошибка в sendOrderEmails:', err);
      }
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
