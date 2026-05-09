// src/app/admin/news/page.tsx - Управление новостями
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faEye, faStar } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';

export default async function NewsAdminPage() {
  const news = await prisma.news.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Новости</h1>
        <Link href="/admin/news/new">
          <Button size="sm" className="bg-[#ee862c] hover:bg-[#f0ac74]">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Добавить новость
          </Button>
        </Link>
      </div>

      <div className="border border-white/10 bg-white/5 backdrop-blur-sm">
        <table className="w-full">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="p-3 text-left text-sm font-medium text-gray-400">Заголовок</th>
              <th className="p-3 text-left text-sm font-medium text-gray-400">Категория</th>
              <th className="p-3 text-left text-sm font-medium text-gray-400">Дата</th>
              <th className="p-3 text-center text-sm font-medium text-gray-400">
                <FontAwesomeIcon icon={faStar} className="text-[#ee862c]" /> Слайдер
              </th>
              <th className="p-3 text-center text-sm font-medium text-gray-400">Статус</th>
              <th className="p-3 text-center text-sm font-medium text-gray-400">Действия</th>
            </tr>
          </thead>
          <tbody>
            {news.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  Нет новостей
                </td>
              </tr>
            ) : (
              news.map((item) => (
                <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3 font-medium text-white">{item.title}</td>
                  <td className="p-3 text-sm text-gray-400">{item.category}</td>
                  <td className="p-3 text-sm text-gray-400">
                    {new Date(item.publishedAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="p-3 text-center">
                    {item.isFeatured ? (
                      <span className="text-[#ee862c]">★</span>
                    ) : (
                      <span className="text-gray-600">☆</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {item.isPublished ? (
                      <span className="text-green-500 text-xs">Опубл.</span>
                    ) : (
                      <span className="text-red-500 text-xs">Скрыто</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <Link
                      href={`/admin/news/${item.id}`}
                      className="text-sm text-[#ee862c] hover:underline"
                    >
                      <FontAwesomeIcon icon={faEdit} className="mr-1" /> Ред.
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
