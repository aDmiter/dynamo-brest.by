// src/app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderEmails } from '@/lib/mailer';
import { auth } from '@/lib/auth';
import { canAccessSection } from '@/lib/admin-permissions';
import { auditUpdateData } from '@/lib/admin-audit-route';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function isGuestPaidStatusUpdate(data: Record<string, unknown>): boolean {
  const keys = Object.keys(data);
  return keys.length === 1 && keys[0] === 'status' && data.status === 'paid';
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = await request.json();
    const session = await auth();
    const user = session?.user;

    const guestPaidOnly = !user && isGuestPaidStatusUpdate(data);
    if (!user && !guestPaidOnly) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }
    if (user && !canAccessSection(user, 'shop')) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }
    if (guestPaidOnly && Object.keys(data).some((k) => k !== 'status')) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const oldOrder = await prisma.order.findUnique({
      where: { id },
      include: { orderitem: { include: { product: true } } },
    });

    if (!oldOrder) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (user && data.trackingCode !== undefined) updateData.trackingCode = data.trackingCode;
    if (user) Object.assign(updateData, await auditUpdateData());

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { orderitem: { include: { product: true } } },
    });

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

    if (data.status && data.status !== oldOrder.status) {
      await sendOrderEmails(orderForEmail, data.status);
    }

    return NextResponse.json(updatedOrder);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const user = session?.user;
    if (!user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }
    if (!canAccessSection(user, 'shop')) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.orderitem.deleteMany({ where: { orderId: id } }),
      prisma.order.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
