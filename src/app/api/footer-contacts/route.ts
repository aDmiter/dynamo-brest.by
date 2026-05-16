// src/app/api/footer-contacts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const contacts =
    (await prisma.footercontacts.findUnique({ where: { id: 'main' } })) ??
    (await prisma.footercontacts.create({
      data: { id: 'main' },
    }));

  return NextResponse.json(contacts);
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    const contacts = await prisma.footercontacts.upsert({
      where: { id: 'main' },
      create: {
        id: 'main',
        title: data.title ?? 'Контакты',
        email: data.email ?? 'info@dynamo-brest.by',
        addressLabel: data.addressLabel ?? 'Адрес офиса в Бресте',
        address: data.address ?? 'г. Брест, ул. Гоголя, 9',
      },
      update: {
        title: data.title,
        email: data.email,
        addressLabel: data.addressLabel,
        address: data.address,
      },
    });

    return NextResponse.json(contacts);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
