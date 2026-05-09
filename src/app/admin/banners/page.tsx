// src/app/admin/banners/page.tsx - Управление рекламными баннерами
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEye, faMousePointer } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';

export default async function BannersAdminPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#003366]">Рекламные баннеры</h1>
        <Link href="/admin/banners/new">
          <Button size="sm">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Добавить баннер
          </Button>
        </Link>
      </div>

      <div className="rounded-lg bg-white shadow">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Превью</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Название</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Позиция</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Активен</th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                <FontAwesomeIcon icon={faEye} className="mr-1" /> Показы
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                <FontAwesomeIcon icon={faMousePointer} className="mr-1" /> Клики
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">Действия</th>
            </tr>
          </thead>
          <tbody>
            {banners.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  Нет баннеров. Нажмите «Добавить баннер».
                </td>
              </tr>
            ) : (
              banners.map((banner) => (
                <tr key={banner.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="h-10 max-w-[100px] object-contain"
                      />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-3 font-medium">{banner.title}</td>
                  <td className="p-3 text-sm text-gray-500">{banner.position}</td>
                  <td className="p-3">
                    {banner.isActive ? (
                      <span className="text-green-600 text-sm">✓</span>
                    ) : (
                      <span className="text-red-600 text-sm">✗</span>
                    )}
                  </td>
                  <td className="p-3 text-sm">{banner.views}</td>
                  <td className="p-3 text-sm">{banner.clicks}</td>
                  <td className="p-3">
                    <Link
                      href={`/admin/banners/${banner.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Редактировать
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
