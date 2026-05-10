// src/app/admin/banners/page.tsx - Управление рекламными баннерами
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faEye, faMousePointer } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import DeleteButton from '@/modules/admin/components/DeleteButton';
import ToggleButton from '@/modules/admin/components/ToggleButton';

export default async function BannersAdminPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-white">Рекламные баннеры</h1>
        <Link href="/admin/banners/new">
          <Button size="sm" className="bg-[#ee862c] hover:bg-[#f0ac74]">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Добавить баннер
          </Button>
        </Link>
      </div>

      <div className="border border-white/10 bg-white/5 backdrop-blur-sm">
        <table className="w-full">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="p-3 text-left text-sm font-medium text-gray-400">#</th>
              <th className="p-3 text-left text-sm font-medium text-gray-400">Превью</th>
              <th className="p-3 text-left text-sm font-medium text-gray-400">Название</th>
              <th className="p-3 text-left text-sm font-medium text-gray-400">Позиция</th>
              <th className="p-3 text-center text-sm font-medium text-gray-400">
                <FontAwesomeIcon icon={faEye} className="mr-1" />
              </th>
              <th className="p-3 text-center text-sm font-medium text-gray-400">
                <FontAwesomeIcon icon={faMousePointer} className="mr-1" />
              </th>
              <th className="p-3 text-center text-sm font-medium text-gray-400">Активен</th>
              <th className="p-3 text-center text-sm font-medium text-gray-400">Действия</th>
            </tr>
          </thead>
          <tbody>
            {banners.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">
                  Нет баннеров. Нажмите «Добавить баннер».
                </td>
              </tr>
            ) : (
              banners.map((banner, index) => (
                <tr
                  key={banner.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-3 text-sm text-gray-500">{index + 1}</td>
                  <td className="p-3">
                    {banner.imageUrl ? (
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="h-10 max-w-[80px] object-contain"
                      />
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    <p className="max-w-[200px] font-medium text-white truncate">{banner.title}</p>
                  </td>
                  <td className="p-3 text-sm text-gray-400">{banner.position}</td>
                  <td className="p-3 text-center text-sm text-gray-400">{banner.views}</td>
                  <td className="p-3 text-center text-sm text-gray-400">{banner.clicks}</td>
                  <td className="p-3 text-center">
                    <ToggleButton
                      id={banner.id}
                      apiUrl="/api/banners"
                      field="isActive"
                      value={banner.isActive}
                      labelOn="Да"
                      labelOff="Нет"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-3">
                      <Link
                        href={`/admin/banners/${banner.id}`}
                        className="inline-flex items-center gap-1 text-sm text-[#ee862c] hover:underline"
                      >
                        <FontAwesomeIcon icon={faEdit} /> Ред.
                      </Link>
                      <DeleteButton id={banner.id} apiUrl="/api/banners" name={banner.title} />
                    </div>
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
