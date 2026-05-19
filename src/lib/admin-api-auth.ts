import { auth } from '@/lib/auth';
import {
  canAccessSection,
  isSuperAdmin,
  type AdminSessionUser,
} from '@/lib/admin-permissions';
import type { AdminSectionId } from '@/config/admin-sections';
import { NextResponse } from 'next/server';

export async function requireAdminSession(): Promise<
  | { session: NonNullable<Awaited<ReturnType<typeof auth>>>; user: AdminSessionUser }
  | NextResponse
> {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }
  return { session, user: session.user as AdminSessionUser };
}

export async function requireSuperAdmin(): Promise<
  | { session: NonNullable<Awaited<ReturnType<typeof auth>>>; user: AdminSessionUser }
  | NextResponse
> {
  const result = await requireAdminSession();
  if (result instanceof NextResponse) return result;
  if (!isSuperAdmin(result.user.role)) {
    return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
  }
  return result;
}

export async function requireAdminSection(
  sectionId: AdminSectionId
): Promise<
  | { session: NonNullable<Awaited<ReturnType<typeof auth>>>; user: AdminSessionUser }
  | NextResponse
> {
  const result = await requireAdminSession();
  if (result instanceof NextResponse) return result;
  if (!canAccessSection(result.user, sectionId)) {
    return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
  }
  return result;
}
