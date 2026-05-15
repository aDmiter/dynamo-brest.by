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
}

export default function ProductImages({ images, productName }: ProductImagesProps) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  return (
    <div className="product-images relative h-full">
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
        <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => thumbsSwiper?.slideTo(i)}
              className="w-14 h-14 overflow-hidden border-2 transition-all"
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
