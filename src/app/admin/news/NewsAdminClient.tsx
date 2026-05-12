// src/app/admin/news/NewsAdminClient.tsx - Клиентская часть новостей с пагинацией
'use client';

import { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faChevronLeft,
  faChevronRight,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import DeleteButton from '@/modules/admin/components/DeleteButton';
import ToggleButton from '@/modules/admin/components/ToggleButton';
import FeaturedButton from '@/modules/admin/components/FeaturedButton';

interface NewsItem {
  id: string;
  title: string;
  category: string;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: string;
}

const PAGE_SIZE = 50;

interface Props {
  initialNews: NewsItem[];
  initialTotal: number;
}

export default function NewsAdminClient({ initialNews, initialTotal }: Props) {
  const [news, setNews] = useState<NewsItem[]>(initialNews);
  const [total, setTotal] = useState(initialTotal);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const loadPage = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const skip = (page - 1) * PAGE_SIZE;
      const res = await fetch(`/api/news?page=${page}&limit=${PAGE_SIZE}`);
      const data = await res.json();
      setNews(
        data.news.map((item: NewsItem) => ({
          ...item,
          publishedAt: item.publishedAt,
        }))
      );
      setTotal(data.total);
      setCurrentPage(page);
    } catch (error) {
      console.error('Ошибка загрузки новостей:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    loadPage(page);
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Link href="/admin/news/new">
          <Button size="sm" className="bg-[#ee862c] hover:bg-[#f0ac74]">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Добавить новость
          </Button>
        </Link>
        <span className="text-sm text-gray-500 ml-auto">{total} новостей</span>
      </div>

      <div className="border border-white/10 bg-white/5 backdrop-blur-sm">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <FontAwesomeIcon icon={faSpinner} className="text-2xl animate-spin mb-2" />
            <p>Загрузка...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-gray-400 w-12">#</th>
                <th className="p-3 text-left text-sm font-medium text-gray-400">Заголовок</th>
                <th className="p-3 text-left text-sm font-medium text-gray-400">Категория</th>
                <th className="p-3 text-left text-sm font-medium text-gray-400">Дата</th>
                <th className="p-3 text-center text-sm font-medium text-gray-400 w-12">★</th>
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
                    <td className="p-3 text-sm text-gray-500">
                      {(currentPage - 1) * PAGE_SIZE + index + 1}
                    </td>
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
                      <FeaturedButton newsId={item.id} isFeatured={item.isFeatured} />
                    </td>
                    <td className="p-3 text-center">
                      <ToggleButton
                        id={item.id}
                        apiUrl="/api/news"
                        field="isPublished"
                        value={item.isPublished}
                        labelOn="Опубл."
                        labelOff="Скрыто"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/admin/news/${item.id}`}
                          className="inline-flex items-center gap-1 text-sm text-[#ee862c] hover:underline"
                        >
                          <FontAwesomeIcon icon={faEdit} /> Ред.
                        </Link>
                        <DeleteButton id={item.id} apiUrl="/api/news" name={item.title} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            className="px-3 py-1 text-sm text-gray-400 border border-white/10 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          {/* Компактная пагинация: показываем не все страницы */}
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let page: number;
            if (totalPages <= 7) {
              page = i + 1;
            } else if (currentPage <= 4) {
              page = i + 1;
            } else if (currentPage >= totalPages - 3) {
              page = totalPages - 6 + i;
            } else {
              page = currentPage - 3 + i;
            }

            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                disabled={loading}
                className={`px-3 py-1 text-sm border ${
                  page === currentPage
                    ? 'border-[#ee862c] text-[#ee862c] bg-[#ee862c]/10'
                    : 'border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                } disabled:opacity-30`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            className="px-3 py-1 text-sm text-gray-400 border border-white/10 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
    </div>
  );
}
