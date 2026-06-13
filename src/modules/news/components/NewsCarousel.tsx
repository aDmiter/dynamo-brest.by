// src/modules/news/components/NewsCarousel.tsx - Карусель новостей на главной
'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useClientMounted } from '@/lib/use-client-mounted';
import HomeSectionHeader from '@/modules/shared/ui/HomeSectionHeader';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
}

interface NewsCarouselProps {
  news: NewsItem[];
}

const SLIDE_HEIGHT = '50vh';

function NewsCarouselCard({ item }: { item: NewsItem }) {
  return (
    <Link
      href={`/news/${item.slug}`}
      className="group relative flex h-full w-full overflow-hidden"
      style={{ borderRadius: 16, height: SLIDE_HEIGHT }}
    >
      <img
        src={item.imageUrl || '/images/placeholder.jpg'}
        alt={item.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, var(--color-bg-main) 0%, rgba(13,17,23,0.55) 40%, rgba(13,17,23,0.02) 100%)',
          zIndex: 2,
        }}
      />
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6" style={{ zIndex: 3 }}>
        <div
          style={{
            border: '1px solid var(--color-border)',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: 12,
            padding: '16px',
            transition: 'all 0.3s ease',
          }}
          className="group-hover:border-[var(--color-accent-30)] group-hover:bg-white/[0.07]"
        >
          <h3
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 'clamp(16px, 2vw, 20px)',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              marginBottom: 12,
              textTransform: 'uppercase',
            }}
            className="line-clamp-2"
          >
            {item.title}
          </h3>
          <div
            style={{
              height: 1,
              width: 36,
              background: 'linear-gradient(to right, var(--color-accent-30), transparent)',
              marginBottom: 12,
            }}
          />
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--color-accent)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Подробнее
            <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function NewsCarousel({ news }: NewsCarouselProps) {
  if (news.length === 0) return null;
  const mounted = useClientMounted();

  return (
    <section
      className="news-carousel relative flex min-h-screen flex-col bg-white"
      style={{ fontFamily: "'Inter Tight', sans-serif" }}
      aria-labelledby="home-news-title"
    >
      <div className="news-carousel__content">
        <div className="news-carousel__inner home-section-inner">
          <HomeSectionHeader
            title="Новости"
            linkHref="/news"
            linkLabel="Все новости"
            titleId="home-news-title"
          />
        </div>

        <div className="news-carousel__slider">
        {mounted ? (
          <Swiper
            spaceBetween={24}
            slidesPerView={1.5}
            centeredSlides={false}
            loop={news.length > 1}
            speed={800}
            breakpoints={{
              640: { slidesPerView: 1.4, spaceBetween: 24 },
              768: { slidesPerView: 1.7, spaceBetween: 28 },
              1024: { slidesPerView: 2, spaceBetween: 32 },
              1280: { slidesPerView: 2.3, spaceBetween: 36 },
              1536: { slidesPerView: 2.5, spaceBetween: 40 },
            }}
            style={{ overflow: 'hidden' }}
          >
            {news.map((item) => (
              <SwiperSlide key={item.id} style={{ height: SLIDE_HEIGHT }}>
                <NewsCarouselCard item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <NewsCarouselCard item={news[0]} />
        )}
        </div>
      </div>

      <div className="news-carousel__title absolute left-0 bottom-0 pointer-events-none select-none">
        <span
          className="block text-[80px] font-black uppercase tracking-[0.1em] text-[var(--color-team-names)]/20 md:text-[120px] leading-none"
          style={{
            writingMode: 'vertical-lr',
            transform: 'rotate(180deg)',
            fontFamily: "'Inter Tight', sans-serif",
            fontWeight: 900,
          }}
        >
          НОВОСТИ
        </span>
      </div>
    </section>
  );
}
