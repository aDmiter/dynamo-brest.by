import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireAdminSection } from '@/lib/admin-api-auth';

export async function POST(request: NextRequest) {
  const authResult = await requireAdminSection('settings');
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const login = String(body.login ?? '').trim();
    const password = String(body.password ?? '');
    const label = String(body.label ?? '').trim() || null;
    const isActive = body.isActive !== false;

    if (!login || login.length < 2) {
      return NextResponse.json({ error: 'Укажите логин (минимум 2 символа)' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Пароль — минимум 6 символов' }, { status: 400 });
    }

    const existing = await prisma.sitePreviewUser.findUnique({ where: { login } });
    if (existing) {
      return NextResponse.json({ error: 'Такой логин уже есть' }, { status: 409 });
    }

    const user = await prisma.sitePreviewUser.create({
      data: {
        login,
        password: await bcrypt.hash(password, 10),
        label,
        isActive,
      },
    });

    return NextResponse.json(
      {
        id: user.id,
        login: user.login,
        label: user.label,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Ошибка создания доступа' }, { status: 500 });
  }
}
