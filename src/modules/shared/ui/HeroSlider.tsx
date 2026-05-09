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
    <section className="hero relative h-screen w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          renderBullet: (index, className) => {
            return `<span class="${className} !w-8 !h-1 !rounded-none !bg-white/50 !opacity-100"></span>`;
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
              <div className="hero__slide-overlay absolute inset-0 bg-black/50" />
              <div className="hero__slide-content absolute inset-0 flex items-center">
                <div className="hero__slide-text w-full pl-6 md:pl-36">
                  <p className="hero__slide-category mb-4 text-sm font-bold uppercase tracking-[0.3em] text-[#ee862c]">
                    {categoryLabels[slide.category] || slide.category}
                  </p>
                  <h1
                    className="hero__slide-title max-w-3xl text-4xl leading-tight text-white md:text-6xl lg:text-7xl"
                    style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
                  >
                    {slide.title}
                  </h1>
                  {slide.slug !== '#' && (
                    <Link
                      href={`/news/${slide.slug}`}
                      className="hero__slide-link mt-8 inline-flex items-center gap-3 border border-white/30 px-8 py-4 text-sm font-medium uppercase tracking-wider text-white transition-colors hover:border-[#ee862c] hover:bg-[#ee862c] hover:text-white"
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
            className="text-white/50 transition-colors hover:text-[#ee862c]"
          >
            <FontAwesomeIcon icon={social.icon} className="text-lg" />
          </a>
        ))}
        <div className="h-12 w-[1px] bg-white/20" />
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
