// src/app/admin/dashboard/page.tsx - Дашборд админ-панели
import { auth } from '@/lib/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFutbol } from '@fortawesome/free-solid-svg-icons';

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-[#003366]">
        <FontAwesomeIcon icon={faFutbol} className="mr-3" />
        Добро пожаловать, {session?.user?.name || 'Администратор'}!
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Карточки статистики */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Всего новостей</h3>
          <p className="mt-2 text-3xl font-bold text-[#003366]">0</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Игроков в составе</h3>
          <p className="mt-2 text-3xl font-bold text-[#003366]">0</p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Заказов в магазине</h3>
          <p className="mt-2 text-3xl font-bold text-[#003366]">0</p>
        </div>
      </div>
    </div>
  );
}
