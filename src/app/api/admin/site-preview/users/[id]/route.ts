import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireAdminSection } from '@/lib/admin-api-auth';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authResult = await requireAdminSection('settings');
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const data: {
      login?: string;
      label?: string | null;
      isActive?: boolean;
      password?: string;
    } = {};

    if (body.login !== undefined) {
      const login = String(body.login).trim();
      if (login.length < 2) {
        return NextResponse.json({ error: 'Логин — минимум 2 символа' }, { status: 400 });
      }
      const dup = await prisma.sitePreviewUser.findFirst({
        where: { login, NOT: { id } },
      });
      if (dup) {
        return NextResponse.json({ error: 'Такой логин уже занят' }, { status: 409 });
      }
      data.login = login;
    }

    if (body.label !== undefined) {
      data.label = String(body.label).trim() || null;
    }

    if (body.isActive !== undefined) {
      data.isActive = Boolean(body.isActive);
    }

    if (body.password !== undefined && String(body.password).length > 0) {
      const password = String(body.password);
      if (password.length < 6) {
        return NextResponse.json({ error: 'Пароль — минимум 6 символов' }, { status: 400 });
      }
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.sitePreviewUser.update({ where: { id }, data });

    return NextResponse.json({
      id: user.id,
      login: user.login,
      label: user.label,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Пользователь не найден или ошибка сохранения' }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const authResult = await requireAdminSection('settings');
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await context.params;

  try {
    await prisma.sitePreviewUser.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Не удалось удалить' }, { status: 404 });
  }
}
