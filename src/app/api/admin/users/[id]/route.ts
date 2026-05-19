import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/admin-api-auth';
import {
  ADMIN_SECTION_IDS,
  type AdminSectionId,
} from '@/config/admin-sections';
import { SUPERADMIN_ROLE } from '@/lib/admin-permissions';

interface RouteParams {
  params: Promise<{ id: string }>;
}

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

async function countSuperadmins(excludeId?: string) {
  return prisma.admin.count({
    where: {
      role: SUPERADMIN_ROLE,
      isActive: true,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireSuperAdmin();
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;
  const currentUserId = authResult.user.id;

  try {
    const existing = await prisma.admin.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    const data = await request.json();
    const update: {
      email?: string;
      name?: string;
      password?: string;
      role?: string;
      isActive?: boolean;
      permissions?: AdminSectionId[] | null;
    } = {};

    if (data.email !== undefined) {
      const email = String(data.email).trim().toLowerCase();
      if (!email) {
        return NextResponse.json({ error: 'Email обязателен' }, { status: 400 });
      }
      const duplicate = await prisma.admin.findFirst({
        where: { email, id: { not: id } },
      });
      if (duplicate) {
        return NextResponse.json({ error: 'Email уже занят' }, { status: 409 });
      }
      update.email = email;
    }

    if (data.name !== undefined) {
      const name = String(data.name).trim();
      if (!name) {
        return NextResponse.json({ error: 'Имя обязательно' }, { status: 400 });
      }
      update.name = name;
    }

    if (data.password !== undefined && String(data.password).length > 0) {
      const password = String(data.password);
      if (password.length < 8) {
        return NextResponse.json({ error: 'Пароль не менее 8 символов' }, { status: 400 });
      }
      update.password = await bcrypt.hash(password, 10);
    }

    if (data.role !== undefined) {
      const role = data.role === SUPERADMIN_ROLE ? SUPERADMIN_ROLE : 'editor';
      if (existing.role === SUPERADMIN_ROLE && role !== SUPERADMIN_ROLE) {
        const others = await countSuperadmins(id);
        if (others === 0) {
          return NextResponse.json(
            { error: 'Нельзя снять роль у единственного суперадминистратора' },
            { status: 400 }
          );
        }
      }
      update.role = role;
      if (role === SUPERADMIN_ROLE) {
        update.permissions = null;
      }
    }

    if (data.isActive !== undefined) {
      const isActive = Boolean(data.isActive);
      if (id === currentUserId && !isActive) {
        return NextResponse.json({ error: 'Нельзя деактивировать себя' }, { status: 400 });
      }
      if (existing.role === SUPERADMIN_ROLE && !isActive) {
        const others = await countSuperadmins(id);
        if (others === 0) {
          return NextResponse.json(
            { error: 'Нельзя деактивировать единственного суперадминистратора' },
            { status: 400 }
          );
        }
      }
      update.isActive = isActive;
    }

    if (data.permissions !== undefined) {
      const role = update.role ?? existing.role;
      if (role === SUPERADMIN_ROLE) {
        update.permissions = null;
      } else {
        const permissions: AdminSectionId[] = Array.isArray(data.permissions)
          ? data.permissions.filter((pid: string): pid is AdminSectionId =>
              ADMIN_SECTION_IDS.includes(pid as AdminSectionId)
            )
          : [];
        update.permissions = permissions;
      }
    }

    const user = await prisma.admin.update({
      where: { id },
      data: update,
    });

    return NextResponse.json(serializeAdmin(user));
  } catch (error) {
    console.error('PATCH /api/admin/users/[id]:', error);
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const authResult = await requireSuperAdmin();
  if (authResult instanceof NextResponse) return authResult;

  const { id } = await params;

  if (id === authResult.user.id) {
    return NextResponse.json({ error: 'Нельзя удалить себя' }, { status: 400 });
  }

  const existing = await prisma.admin.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
  }

  if (existing.role === SUPERADMIN_ROLE) {
    const others = await countSuperadmins(id);
    if (others === 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить единственного суперадминистратора' },
        { status: 400 }
      );
    }
  }

  await prisma.admin.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
