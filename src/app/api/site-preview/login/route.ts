import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSitePreviewStatus } from '@/lib/site-preview';
import { createSitePreviewToken, previewSessionCookieOptions } from '@/lib/site-preview-auth';

export async function POST(request: NextRequest) {
  const { enabled } = await getSitePreviewStatus();
  if (!enabled) {
    return NextResponse.json({ error: 'Доступ по паролю сейчас не требуется' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const login = String(body.login ?? '').trim();
    const password = String(body.password ?? '');

    if (!login || !password) {
      return NextResponse.json({ error: 'Введите логин и пароль' }, { status: 400 });
    }

    const user = await prisma.sitePreviewUser.findUnique({ where: { login } });
    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 });
    }

    const token = await createSitePreviewToken(user.id);
    const response = NextResponse.json({ success: true });
    const opts = previewSessionCookieOptions();
    response.cookies.set(opts.name, token, opts);
    return response;
  } catch {
    return NextResponse.json({ error: 'Ошибка входа' }, { status: 500 });
  }
}
