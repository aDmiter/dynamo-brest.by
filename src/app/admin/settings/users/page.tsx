import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { isSuperAdmin, parseAdminPermissions } from '@/lib/admin-permissions';
import AdminUsersManager from '@/modules/admin/components/AdminUsersManager';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Пользователи | Админ-панель',
};

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || !isSuperAdmin(session.user.role)) {
    redirect('/admin/dashboard');
  }

  const rows = await prisma.admin.findMany({ orderBy: { createdAt: 'asc' } });
  const initialUsers = rows.map((admin) => ({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    permissions: parseAdminPermissions(admin.permissions),
    isActive: admin.isActive,
  }));

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white mb-8">Пользователи админки</h1>
      <AdminUsersManager initialUsers={initialUsers} />
    </div>
  );
}
