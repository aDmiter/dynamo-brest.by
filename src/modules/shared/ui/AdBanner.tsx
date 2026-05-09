'use client';
// src/modules/shared/ui/AdBanner.tsx - Рекламный баннер на главной

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
      className="banner relative flex h-screen items-center justify-center overflow-hidden"
      style={{
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Фон, если нет картинки */}
      {!backgroundUrl && (
        <div className="banner__background-solid absolute inset-0 bg-gradient-to-br from-[#0B0F1C] via-[#0D1225] to-[#0F1529]" />
      )}

      {/* Контейнер для баннера */}
      <div className="banner__container relative z-10 flex items-center justify-center px-4">
        <a
          href={linkUrl}
          target="_blank"
          rel="nofollow noopener noreferrer"
          onClick={handleClick}
          className="banner__link group relative block"
        >
          <img
            src={imageUrl}
            alt={title}
            className="banner__image max-h-[300px] w-auto max-w-full object-contain md:max-w-[1400px]"
          />
        </a>
      </div>

      {/* Заголовок модуля */}
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
