// src/app/shop/product/[slug]/ProductImages.tsx - Слайдер изображений товара
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
    <div className="product-images">
      {/* Главный слайдер */}
      <Swiper
        spaceBetween={0}
        slidesPerView={1}
        thumbs={{ swiper: thumbsSwiper }}
        modules={[Thumbs]}
        className="product-images__main aspect-square"
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

      {/* Превью под слайдером */}
      {images.length > 1 && (
        <Swiper
          onSwiper={setThumbsSwiper}
          spaceBetween={8}
          slidesPerView={4}
          watchSlidesProgress
          modules={[Thumbs]}
          className="product-images__thumbs mt-4"
        >
          {images.map((img, i) => (
            <SwiperSlide
              key={i}
              className="cursor-pointer border-2 border-transparent transition-colors hover:border-[#ee862c]"
            >
              <img
                src={img}
                alt={`${productName} - превью ${i + 1}`}
                className="aspect-square w-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}
