'use client';
// src/modules/shared/ui/AdBanner.tsx - Рекламный баннер на главной

import { useEffect, useRef } from 'react';

const PARALLAX_AMPLITUDE_PX = 30;

interface AdBannerProps {
  title: string;
  imageUrl: string;
  linkUrl: string;
  backgroundUrl?: string | null;
  bannerId: string;
}

export default function AdBanner({
  title,
  imageUrl,
  linkUrl,
  backgroundUrl,
  bannerId,
}: AdBannerProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const image = imageRef.current;
    if (!section || !image) return;

    const half = PARALLAX_AMPLITUDE_PX / 2;

    const updateParallax = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollRange = rect.height + vh;
      const scrolled = vh - rect.top;
      const progress = Math.min(1, Math.max(0, scrolled / scrollRange));
      const offsetY = -half + progress * PARALLAX_AMPLITUDE_PX;
      image.style.transform = `translate3d(0, ${offsetY}px, 0)`;
    };

    updateParallax();
    window.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', updateParallax);

    return () => {
      window.removeEventListener('scroll', updateParallax);
      window.removeEventListener('resize', updateParallax);
    };
  }, []);

  const handleClick = async () => {
    try {
      await fetch('/api/banners/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerId }),
      });
    } catch {
      // silently fail
    }
  };

  return (
    <section
      ref={sectionRef}
      className="banner relative flex h-screen items-center justify-center overflow-hidden"
      style={{
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {!backgroundUrl && (
        <div className="banner__background-solid absolute inset-0 bg-gradient-to-br from-[#0B0F1C] via-[#0D1225] to-[#0F1529]" />
      )}

      <div className="banner__container relative z-10 flex items-center justify-center px-4">
        <a
          href={linkUrl}
          target="_blank"
          rel="nofollow noopener noreferrer"
          onClick={handleClick}
          className="banner__link group"
        >
          <div className="banner__image-wrap">
            <img ref={imageRef} src={imageUrl} alt={title} className="banner__image" />
          </div>
        </a>
      </div>

      <div className="banner__title absolute left-0 bottom-0 pointer-events-none select-none">
        <span
          className="block text-[80px] font-black uppercase tracking-[0.1em] text-white/[0.15] md:text-[120px] leading-none"
          style={{
            writingMode: 'vertical-lr',
            transform: 'rotate(180deg)',
            fontFamily: "'Inter Tight', sans-serif",
            fontWeight: 900,
          }}
        >
          ПАРТНЁРЫ
        </span>
      </div>
    </section>
  );
}
