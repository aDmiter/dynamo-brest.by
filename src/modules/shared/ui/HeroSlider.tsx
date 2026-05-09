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
import {
  faFacebookF,
  faVk,
  faXTwitter,
  faInstagram,
  faOdnoklassniki,
  faTelegram,
  faYoutube,
} from '@fortawesome/free-brands-svg-icons';

const socialLinks = [
  { icon: faFacebookF, href: 'https://facebook.com/dynamobrest', label: 'Facebook' },
  { icon: faVk, href: 'https://vk.com/dynamobrest', label: 'VK' },
  { icon: faXTwitter, href: 'https://x.com/dynamobrest', label: 'X' },
  { icon: faInstagram, href: 'https://instagram.com/dynamobrest', label: 'Instagram' },
  { icon: faOdnoklassniki, href: 'https://ok.ru/dynamobrest', label: 'OK' },
  { icon: faTelegram, href: 'https://t.me/dynamobrest', label: 'Telegram' },
  { icon: faYoutube, href: 'https://youtube.com/dynamobrest?sub_confirmation=1', label: 'YouTube' },
];

const slides = [
  {
    id: 1,
    image:
      'https://dynamo-brest.by/media/k2/items/cache/67899e7fd4ecfa2dfbb22dd7dc4be700_XL.jpg?t=20260505_090136',
    title: 'Динамо-Брест — Чемпион!',
    subtitle: 'Сезон 2019',
    link: '/news/1',
  },
  {
    id: 2,
    image: 'https://dynamo-brest.by/media/k2/items/cache/b1eefcf0678c4d0c3dbe290fb1f7fde3_XL.jpg',
    title: 'Новый сезон 2026',
    subtitle: 'Мы готовы к новым победам',
    link: '/news/2',
  },
  {
    id: 3,
    image: 'https://dynamo-brest.by/media/k2/items/cache/919765d8a2205497b8b46a1f7bfc492c_XL.jpg',
    title: 'Кубок Беларуси',
    subtitle: 'Выход в финал',
    link: '/news/3',
  },
];

export default function HeroSlider() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
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
        className="h-full w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full w-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex items-center">
                <div className="w-full pl-6 md:pl-36">
                  <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[#ee862c]">
                    {slide.subtitle}
                  </p>
                  <h1
                    className="max-w-3xl text-5xl leading-tight text-white md:text-7xl lg:text-8xl"
                    style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
                  >
                    {slide.title}
                  </h1>
                  <Link
                    href={slide.link}
                    className="mt-8 inline-flex items-center gap-3 border border-white/30 px-8 py-4 text-sm font-medium uppercase tracking-wider text-white transition-colors hover:border-[#ee862c] hover:bg-[#ee862c] hover:text-white"
                  >
                    Подробнее
                    <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Социальные сети справа */}
      <div className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-6 md:flex">
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
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-white/60">
          <span className="text-[10px] uppercase tracking-[0.4em]">Scroll</span>
          <div className="h-12 w-[1px] bg-white/30" />
        </div>
      </div>
    </section>
  );
}
