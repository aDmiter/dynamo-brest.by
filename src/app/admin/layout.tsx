// src/app/admin/layout.tsx - Layout админ-панели (glassmorphism)
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/modules/admin/components/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#0B0F1C] via-[#0D1225] to-[#0F1529]">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
