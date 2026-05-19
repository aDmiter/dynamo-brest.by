import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/admin-api-auth';
import {
  ADMIN_SECTION_IDS,
  type AdminSectionId,
} from '@/config/admin-sections';
import { SUPERADMIN_ROLE } from '@/lib/admin-permissions';

function serializeAdmin(admin: {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: unknown;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  const permissions = Array.isArray(admin.permissions)
    ? admin.permissions.filter((id): id is AdminSectionId =>
        ADMIN_SECTION_IDS.includes(id as AdminSectionId)
      )
    : [];

  return {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    permissions,
    isActive: admin.isActive,
    createdAt: admin.createdAt.toISOString(),
    updatedAt: admin.updatedAt.toISOString(),
  };
}

export async function GET() {
  const authResult = await requireSuperAdmin();
  if (authResult instanceof NextResponse) return authResult;

  const users = await prisma.admin.findMany({
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(users.map(serializeAdmin));
}

export async function POST(request: NextRequest) {
  const authResult = await requireSuperAdmin();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const data = await request.json();
    const email = String(data.email ?? '').trim().toLowerCase();
    const name = String(data.name ?? '').trim();
    const password = String(data.password ?? '');
    const role = data.role === SUPERADMIN_ROLE ? SUPERADMIN_ROLE : 'editor';
    const isActive = data.isActive !== false;
    const permissions: AdminSectionId[] = Array.isArray(data.permissions)
      ? data.permissions.filter((id: string): id is AdminSectionId =>
          ADMIN_SECTION_IDS.includes(id as AdminSectionId)
        )
      : [];

    if (!email || !name || password.length < 8) {
      return NextResponse.json(
        { error: 'Укажите email, имя и пароль (минимум 8 символов)' },
        { status: 400 }
      );
    }

    const existing = await prisma.admin.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email уже занят' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.admin.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        isActive,
        permissions: role === SUPERADMIN_ROLE ? undefined : permissions,
      },
    });

    return NextResponse.json(serializeAdmin(user), { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/users:', error);
    return NextResponse.json({ error: 'Ошибка создания пользователя' }, { status: 500 });
  }
}
