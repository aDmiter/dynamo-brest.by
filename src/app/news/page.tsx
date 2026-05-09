// src/app/news/page.tsx - Страница новостей
'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faArrowRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { socialLinks } from '@/modules/config/social';

const categoryLabels: Record<string, string> = {
  general: 'Общее',
  polls: 'Опросы',
  events: 'События',
  press: 'Пресса',
  youth: 'Дубль',
  academy: 'Академия',
  club: 'Клуб',
  partners: 'Партнёры',
  shop: 'Магазин',
  tickets: 'Билеты',
  video: 'Видео',
  school: 'Школа',
  'first-team': 'Основной состав',
  interviews: 'Интервью',
  season: 'Сезон',
  transfers: 'Трансферы',
  friendly: 'Товарищеские матчи',
  cup: 'Кубок',
  history: 'История',
  women: 'Женская команда',
  eurocups: 'Еврокубки',
};

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
      const limit = pageNum === 1 ? 13 : 12;
      const res = await fetch(`/api/news?page=${pageNum}&limit=${limit}`);
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

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadNews(nextPage);
  }, [page, loadNews]);

  if (!started) {
    setStarted(true);
    loadNews(1);
  }

  if (news.length === 0 && !loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F1C]">
        <p className="text-xl text-gray-500">Новостей пока нет</p>
      </div>
    );
  }

  const firstNews = news[0];
  const restNews = news.slice(1);

  return (
    <div className="news-page">
      {/* Первая новость — 100vh как слайдер */}
      {firstNews && (
        <section className="news-page__hero relative h-screen w-full overflow-hidden">
          <img
            src={firstNews.imageUrl || '/images/placeholder.jpg'}
            alt={firstNews.title}
            className="news-page__hero-image absolute inset-0 h-full w-full object-cover"
          />
          <div className="news-page__hero-overlay absolute inset-0 bg-black/50" />

          <div className="news-page__hero-content absolute inset-0 flex items-center">
            <div className="w-full pl-6 md:pl-36">
              <p className="news-page__hero-category mb-4 text-sm font-bold uppercase tracking-[0.3em] text-[#ee862c]">
                {categoryLabels[firstNews.category] || firstNews.category}
              </p>
              <h1
                className="news-page__hero-title max-w-3xl text-4xl leading-tight text-white md:text-6xl lg:text-7xl"
                style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
              >
                {firstNews.title}
              </h1>
              <p className="news-page__hero-date mt-6 flex items-center gap-2 text-sm text-white/50">
                <FontAwesomeIcon icon={faCalendarAlt} className="text-[#ee862c]" />
                {new Date(firstNews.publishedAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <Link
                href={`/news/${firstNews.slug}`}
                className="news-page__hero-link mt-8 inline-flex items-center gap-3 border border-white/30 px-8 py-4 text-sm font-medium uppercase tracking-wider text-white transition-colors hover:border-[#ee862c] hover:bg-[#ee862c] hover:text-white"
              >
                Читать
                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
              </Link>
            </div>
          </div>

          {/* Социальные сети справа */}
          <div className="news-page__social absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-6 md:flex">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-white/50 transition-colors hover:text-[#ee862c]"
              >
                <FontAwesomeIcon icon={social.icon} className="text-lg" />
              </a>
            ))}
            <div className="h-12 w-[1px] bg-white/20" />
          </div>

          <div className="news-page__scroll absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
            <div className="flex flex-col items-center gap-2 text-white/60">
              <span className="text-[10px] uppercase tracking-[0.4em]">Новости</span>
              <div className="h-12 w-[1px] bg-white/30" />
            </div>
          </div>
        </section>
      )}

      {/* Остальные новости — белый фон */}
      {restNews.length > 0 && (
        <section className="news-page__grid-section relative bg-white py-16">
          <div className="mx-auto max-w-[1200px] px-4 md:px-8">
            <div className="news-page__grid grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {restNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className="news-page__card group relative flex h-[350px] md:h-[380px] overflow-hidden"
                >
                  <img
                    src={item.imageUrl || '/images/placeholder.jpg'}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#ee862c]">
                      {categoryLabels[item.category] || item.category}
                    </p>
                    <h3
                      className="text-lg font-bold text-white md:text-xl line-clamp-2 leading-tight transition-colors group-hover:text-[#ee862c]"
                      style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
                    >
                      {item.title}
                    </h3>
                    <p className="mt-2 flex items-center gap-2 text-xs text-white/40">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {new Date(item.publishedAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="news-page__load-more mt-12 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="group inline-flex items-center gap-3 px-10 py-5 text-sm font-bold uppercase tracking-wider text-gray-400 transition-all duration-300 hover:text-[#242C41] hover:scale-105 disabled:opacity-30"
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

          <div className="news-page__title absolute right-0 bottom-0 pointer-events-none select-none">
            <span
              className="block text-[80px] font-black uppercase tracking-[0.1em] text-[#a5b3d5]/20 md:text-[120px] leading-none"
              style={{
                writingMode: 'vertical-lr',
                fontFamily: "'Inter Tight', sans-serif",
                fontWeight: 900,
              }}
            >
              НОВОСТИ
            </span>
          </div>
        </section>
      )}
    </div>
  );
}
