// src/app/shop/product/[slug]/ProductImages.tsx
'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Thumbs } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/thumbs';
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
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
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
        thumbs={{ swiper: thumbsSwiper }}
        modules={[Thumbs]}
        className="product-images__main h-full"
      >
        {images.map((img, i) => (
          <SwiperSlide key={i}>
            <img
              src={img}
              alt={`${productName} - фото ${i + 1}`}
              className="h-full w-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {images.length > 1 && (
        <div
          className={`absolute left-1/2 z-10 flex -translate-x-1/2 gap-2 ${isMobile ? 'bottom-3' : 'bottom-6'}`}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => thumbsSwiper?.slideTo(i)}
              className={`overflow-hidden border-2 transition-all ${isMobile ? 'h-11 w-11' : 'h-14 w-14'}`}
              style={{
                borderRadius: 8,
                borderColor:
                  i === thumbsSwiper?.activeIndex
                    ? 'var(--color-accent)'
                    : 'rgba(255,255,255,0.15)',
                boxShadow:
                  i === thumbsSwiper?.activeIndex ? '0 0 0 2px var(--color-accent-20)' : 'none',
              }}
            >
              <img
                src={img}
                alt={`${productName} - превью ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
