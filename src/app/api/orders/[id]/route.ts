// src/app/api/orders/[id]/route.ts - API конкретного заказа
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

    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.trackingCode !== undefined) updateData.trackingCode = data.trackingCode;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: { orderitem: { include: { product: true } } },
    });

    // Если изменился статус или трекинг-код — отправляем письмо
    if (data.status || data.trackingCode !== undefined) {
      sendOrderEmails(order, data.status).catch(console.error);
    }

    return NextResponse.json(order);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
