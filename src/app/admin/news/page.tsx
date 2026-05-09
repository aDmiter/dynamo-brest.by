// src/app/admin/news/page.tsx - Управление новостями
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import DeleteNewsButton from './DeleteNewsButton';
import ToggleFeaturedButton from './ToggleFeaturedButton';
import TogglePublishButton from './TogglePublishButton';

export default async function NewsAdminPage() {
  const news = await prisma.news.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 100,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-white">Новости</h1>
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
              <th className="p-3 text-left text-sm font-medium text-gray-400">#</th>
              <th className="p-3 text-left text-sm font-medium text-gray-400">Заголовок</th>
              <th className="p-3 text-left text-sm font-medium text-gray-400">Категория</th>
              <th className="p-3 text-left text-sm font-medium text-gray-400">Дата</th>
              <th className="p-3 text-center text-sm font-medium text-gray-400">★</th>
              <th className="p-3 text-center text-sm font-medium text-gray-400">Статус</th>
              <th className="p-3 text-center text-sm font-medium text-gray-400">Действия</th>
            </tr>
          </thead>
          <tbody>
            {news.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  Нет новостей
                </td>
              </tr>
            ) : (
              news.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-3 text-sm text-gray-500">{index + 1}</td>
                  <td className="p-3">
                    <div className="max-w-[300px]">
                      <p className="font-medium text-white truncate">{item.title}</p>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-400">{item.category}</td>
                  <td className="p-3 text-sm text-gray-400">
                    {new Date(item.publishedAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="p-3 text-center">
                    <ToggleFeaturedButton newsId={item.id} isFeatured={item.isFeatured} />
                  </td>
                  <td className="p-3 text-center">
                    <TogglePublishButton newsId={item.id} isPublished={item.isPublished} />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-3">
                      <Link
                        href={`/admin/news/${item.id}`}
                        className="inline-flex items-center gap-1 text-sm text-[#ee862c] hover:underline"
                      >
                        <FontAwesomeIcon icon={faEdit} /> Ред.
                      </Link>
                      <DeleteNewsButton newsId={item.id} newsTitle={item.title} />
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
