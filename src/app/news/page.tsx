// src/app/news/page.tsx - Страница новостей
'use client';

import { useState, useCallback } from 'react';
import NewsCard from '@/modules/news/components/NewsCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faNewspaper, faChevronDown } from '@fortawesome/free-solid-svg-icons';

interface NewsItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  publishedAt: string;
  category: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const loadNews = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/news?page=${pageNum}&limit=12`);
      const data = await res.json();
      if (pageNum === 1) {
        setNews(data.news);
      } else {
        setNews((prev) => [...prev, ...data.news]);
      }
      setHasMore(data.hasMore);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  // Запускаем загрузку один раз
  if (!started) {
    setStarted(true);
    loadNews(1);
  }

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadNews(nextPage);
  };

  return (
    <div className="container mx-auto px-4 py-16 md:ml-20">
      <div className="news__header mb-12 text-center">
        <FontAwesomeIcon icon={faNewspaper} className="mb-4 text-4xl text-[#ee862c]" />
        <h1 className="font-heading text-4xl font-bold text-white md:text-6xl">Новости</h1>
      </div>

      {news.length === 0 && !loading ? (
        <div className="py-20 text-center text-gray-500">
          <p className="text-xl">Новостей пока нет</p>
        </div>
      ) : (
        <div className="news__grid grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <NewsCard
              key={item.id}
              slug={item.slug}
              title={item.title}
              excerpt={item.excerpt}
              imageUrl={item.imageUrl}
              publishedAt={new Date(item.publishedAt)}
              category={item.category}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div className="news__load-more mt-12 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="group inline-flex items-center gap-3 border border-white/20 px-10 py-5 text-sm font-bold uppercase tracking-wider text-white transition-all hover:border-[#ee862c] hover:bg-[#ee862c]/10 hover:text-[#ee862c] disabled:opacity-50"
          >
            {loading ? (
              'Загрузка...'
            ) : (
              <>
                Хочу еще почитать
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="text-xs transition-transform group-hover:translate-y-1"
                />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
