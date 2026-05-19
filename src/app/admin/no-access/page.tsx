import type { Metadata } from 'next';
import Link from 'next/link';
import { signOut } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Нет доступа | Админ-панель',
};

export default function AdminNoAccessPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="font-heading text-2xl font-bold text-white mb-4">Нет доступа</h1>
      <p className="text-gray-400 max-w-md mb-8">
        У вашей учётной записи не назначены разделы админ-панели. Обратитесь к суперадминистратору.
      </p>
      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/admin/login' });
        }}
      >
        <button
          type="submit"
          className="text-sm text-[#ee862c] hover:text-[#f0ac74] underline-offset-2 hover:underline"
        >
          Выйти
        </button>
      </form>
      <Link href="/" className="mt-4 text-sm text-gray-500 hover:text-white">
        На главную сайта
      </Link>
    </div>
  );
}
