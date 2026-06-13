// src/app/shop/product/[slug]/ProductImages.tsx
'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import type { Swiper as SwiperType } from 'swiper';

interface ProductImagesProps {
  images: string[];
  productName: string;
  layout?: 'desktop' | 'mobile';
}

export default function ProductImages({
  images,
  productName,
  layout = 'desktop',
}: ProductImagesProps) {
  const [mainSwiper, setMainSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = layout === 'mobile';

  return (
    <div
      className={
        isMobile
          ? 'product-images product-images--mobile relative aspect-[4/5] w-full max-h-[70vh]'
          : 'product-images relative h-full'
      }
    >
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        modules={[Pagination]}
        pagination={
          images.length > 1 && isMobile
            ? { clickable: true, dynamicBullets: true }
            : false
        }
        onSwiper={setMainSwiper}
        onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        className="product-images__main h-full"
      >
        {images.map((img, i) => (
          <SwiperSlide key={`${img}-${i}`}>
            <img
              src={img}
              alt={`${productName} - фото ${i + 1}`}
              className="h-full w-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {images.length > 1 && !isMobile ? (
        <div className="absolute bottom-6 left-1/2 z-10 flex max-w-[90%] -translate-x-1/2 gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={`${img}-thumb-${i}`}
              type="button"
              onClick={() => mainSwiper?.slideTo(i)}
              className="h-14 w-14 shrink-0 overflow-hidden border-2 transition-all"
              style={{
                borderRadius: 8,
                borderColor:
                  i === activeIndex ? 'var(--color-accent)' : 'rgba(255,255,255,0.15)',
                boxShadow:
                  i === activeIndex ? '0 0 0 2px var(--color-accent-20)' : 'none',
              }}
            >
              <img
                src={img}
                alt={`${productName} - превью ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      {images.length > 1 && isMobile ? (
        <div className="absolute right-3 top-3 z-10 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
          {activeIndex + 1} / {images.length}
        </div>
      ) : null}
    </div>
  );
}
