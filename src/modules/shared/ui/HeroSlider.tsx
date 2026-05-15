// src/modules/shared/ui/HeroSlider.tsx - Полноэкранный слайдер новостей
'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
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

interface FeaturedNews {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
  category: string;
}

interface HeroSliderProps {
  featuredNews: FeaturedNews[];
}

const defaultSlides = [
  {
    id: '1',
    title: 'Динамо-Брест — Чемпион!',
    slug: '#',
    imageUrl:
      'https://dynamo-brest.by/media/k2/items/cache/67899e7fd4ecfa2dfbb22dd7dc4be700_XL.jpg?t=20260505_090136',
    category: 'Клуб',
  },
];

export default function HeroSlider({ featuredNews }: HeroSliderProps) {
  const slides = featuredNews.length > 0 ? featuredNews : defaultSlides;

  return (
    <section
      className="hero relative h-screen w-full overflow-hidden"
      style={{ fontFamily: "'Inter Tight', sans-serif", background: 'var(--color-bg-main)' }}
    >
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          renderBullet: (index, className) => {
            return `<span class="${className}" style="width: 32px; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.5); opacity: 1; margin: 0 4px;"></span>`;
          },
        }}
        loop={true}
        className="hero__swiper h-full w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="hero__slide relative h-full w-full">
              <img
                src={slide.imageUrl || '/images/placeholder.jpg'}
                alt={slide.title}
                className="hero__slide-image absolute inset-0 h-full w-full object-cover"
              />
              <div className="hero__slide-overlay absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
              <div className="hero__slide-content absolute inset-0 flex items-center">
                <div className="hero__slide-text w-full pl-6 md:pl-36">
                  {/* Категория — как позиция на странице игрока */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div
                      style={{
                        background: 'var(--color-accent-10)',
                        border: '1.5px solid var(--color-accent)',
                        borderRadius: 6,
                        padding: '4px 12px',
                        fontFamily: "'Inter Tight', sans-serif",
                        fontSize: 11,
                        fontWeight: 700,
                        color: 'var(--color-accent)',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        backdropFilter: 'blur(6px)',
                        WebkitBackdropFilter: 'blur(6px)',
                      }}
                    >
                      {categoryLabels[slide.category] || slide.category}
                    </div>
                    <div
                      style={{
                        height: 1,
                        width: 32,
                        background:
                          'linear-gradient(to right, var(--color-accent-30), transparent)',
                      }}
                    />
                  </div>

                  <h1
                    className="hero__slide-title max-w-3xl text-4xl leading-[0.92] text-white md:text-6xl lg:text-7xl"
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontWeight: 900,
                      letterSpacing: '-0.03em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {slide.title}
                  </h1>

                  {slide.slug !== '#' && (
                    <Link
                      href={`/news/${slide.slug}`}
                      className="hero__slide-link mt-10 inline-flex items-center gap-2"
                      style={{
                        background: 'transparent',
                        border: '1.5px solid rgba(255,255,255,0.2)',
                        borderRadius: 8,
                        padding: '10px 20px',
                        color: 'rgba(255,255,255,0.7)',
                        fontFamily: "'Inter Tight', sans-serif",
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        const t = e.currentTarget as HTMLAnchorElement;
                        t.style.borderColor = 'var(--color-accent)';
                        t.style.color = 'var(--color-accent)';
                        t.style.background = 'var(--color-accent-7)';
                      }}
                      onMouseLeave={(e) => {
                        const t = e.currentTarget as HTMLAnchorElement;
                        t.style.borderColor = 'rgba(255,255,255,0.2)';
                        t.style.color = 'rgba(255,255,255,0.7)';
                        t.style.background = 'transparent';
                      }}
                    >
                      Подробнее
                      <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Социальные сети справа */}
      <div className="hero__social absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-6 md:flex">
        {socialLinks.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            style={{ color: 'rgba(255,255,255,0.45)', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => {
              const t = e.currentTarget as HTMLAnchorElement;
              t.style.color = 'rgba(255,255,255,0.95)';
              t.style.transform = 'scale(1.15)';
            }}
            onMouseLeave={(e) => {
              const t = e.currentTarget as HTMLAnchorElement;
              t.style.color = 'rgba(255,255,255,0.45)';
              t.style.transform = 'scale(1)';
            }}
          >
            <FontAwesomeIcon icon={social.icon} style={{ width: 16, height: 16 }} />
          </a>
        ))}
        <div
          style={{
            width: 1,
            height: 40,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)',
            marginTop: 4,
          }}
        />
      </div>

      {/* Индикатор скролла */}
      <div className="hero__scroll-indicator absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="text-[10px] uppercase tracking-[0.4em]">Scroll</span>
          <div className="h-12 w-[1px] bg-white/30" />
        </div>
      </div>
    </section>
  );
}
