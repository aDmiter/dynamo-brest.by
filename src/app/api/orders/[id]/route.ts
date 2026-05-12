// src/app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderEmails } from '@/lib/mailer';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = await request.json();

    // Получаем заказ до обновления
    const oldOrder = await prisma.order.findUnique({
      where: { id },
      include: { orderitem: { include: { product: true } } },
    });

    if (!oldOrder) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    // Обновляем заказ
    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.trackingCode !== undefined) updateData.trackingCode = data.trackingCode;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { orderitem: { include: { product: true } } },
    });

    // Преобразуем Decimal в number
    const orderForEmail = {
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      customerName: updatedOrder.customerName,
      customerEmail: updatedOrder.customerEmail,
      customerPhone: updatedOrder.customerPhone,
      address: updatedOrder.address,
      status: updatedOrder.status,
      trackingCode: updatedOrder.trackingCode,
      total: Number(updatedOrder.total),
      deliveryPrice: updatedOrder.deliveryPrice ? Number(updatedOrder.deliveryPrice) : null,
      orderitem: updatedOrder.orderitem.map((item) => ({
        quantity: item.quantity,
        price: Number(item.price),
        size: item.size,
        product: { name: item.product.name },
      })),
    };

    // Если статус изменился — отправляем письмо
    if (data.status && data.status !== oldOrder.status) {
      await sendOrderEmails(orderForEmail, data.status);
    }

    return NextResponse.json(updatedOrder);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
