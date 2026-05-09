// src/modules/news/components/NewsCarousel.tsx - Карусель новостей на главной
'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  imageUrl: string | null;
}

interface NewsCarouselProps {
  news: NewsItem[];
}

export default function NewsCarousel({ news }: NewsCarouselProps) {
  if (news.length === 0) return null;

  return (
    <section className="news-carousel relative flex min-h-screen items-center bg-white">
      {/* Карусель — отступ слева 20% */}
      <div className="news-carousel__slider w-full" style={{ paddingLeft: '20%' }}>
        <Swiper
          spaceBetween={24}
          slidesPerView={1.5}
          centeredSlides={false}
          loop={true}
          speed={800}
          breakpoints={{
            640: { slidesPerView: 1.8, spaceBetween: 24 },
            768: { slidesPerView: 2.2, spaceBetween: 32 },
            1024: { slidesPerView: 2.5, spaceBetween: 32 },
            1280: { slidesPerView: 3, spaceBetween: 40 },
            1536: { slidesPerView: 3.5, spaceBetween: 40 },
          }}
          style={{ overflow: 'hidden' }}
        >
          {news.map((item) => (
            <SwiperSlide key={item.id} style={{ height: '70vh' }}>
              <Link
                href={`/news/${item.slug}`}
                className="group relative flex h-full w-full overflow-hidden"
              >
                <img
                  src={item.imageUrl || '/images/placeholder.jpg'}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <div className="border border-white/10 bg-white/5 backdrop-blur-md p-5 transition-all group-hover:border-[#ee862c]/30 group-hover:bg-white/10">
                    <h3
                      className="mb-3 text-lg font-bold text-white md:text-xl lg:text-2xl line-clamp-2 leading-tight"
                      style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
                    >
                      {item.title}
                    </h3>
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ee862c] transition-all group-hover:gap-3">
                      Подробнее
                      <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
                    </span>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Заголовок модуля — левый нижний угол, снизу вверх */}
      <div className="news-carousel__title absolute left-0 bottom-0 pointer-events-none select-none">
        <span
          className="block text-[80px] font-black uppercase tracking-[0.1em] text-[#a5b3d5]/20 md:text-[120px] leading-none"
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
