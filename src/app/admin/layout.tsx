// src/app/admin/layout.tsx - Layout админ-панели
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/modules/admin/components/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
