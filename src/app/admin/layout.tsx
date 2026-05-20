// src/app/admin/layout.tsx - Layout админ-панели (glassmorphism)
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import AdminSidebar from '@/modules/admin/components/AdminSidebar';
import {
  canAccessAdminPath,
  getFirstAllowedAdminPath,
  getSessionPermissions,
  isSuperAdmin,
} from '@/lib/admin-permissions';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const pathname = (await headers()).get('x-pathname') ?? '';
  const isLogin = pathname === '/admin/login' || pathname.startsWith('/admin/login/');
  const isNoAccess = pathname === '/admin/no-access';

  if (!session) {
    if (!isLogin) redirect('/admin/login');
    return <>{children}</>;
  }

  if (isLogin) {
    redirect(getFirstAllowedAdminPath(session.user));
  }

  if (!canAccessAdminPath(session.user, pathname)) {
    redirect(getFirstAllowedAdminPath(session.user));
  }

  const permissions = getSessionPermissions(session.user);
  const showUsersLink = isSuperAdmin(session.user.role);

  if (isNoAccess) {
    return (
      <div className="admin-app flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0B0F1C] via-[#0D1225] to-[#0F1529] p-8">
        {children}
      </div>
    );
  }

  return (
    <div className="admin-app flex min-h-screen bg-gradient-to-br from-[#0B0F1C] via-[#0D1225] to-[#0F1529]">
      <AdminSidebar permissions={permissions} showUsersLink={showUsersLink} />
      <main className="relative flex-1 overflow-y-auto">
        <div className="sticky top-0 z-20 flex justify-end px-8 pt-6 pb-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-[#ee862c]/50 hover:text-white"
          >
            На сайт
          </Link>
        </div>
        <div className="px-8 pb-8 pt-2">{children}</div>
      </main>
    </div>
  );
}
