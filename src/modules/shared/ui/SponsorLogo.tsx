// src/modules/shared/ui/SponsorLogo.tsx - Логотип спонсора (клиентский компонент)
'use client';

interface SponsorLogoProps {
  imageUrl: string;
  name: string;
  linkUrl?: string | null;
  className?: string;
}

export default function SponsorLogo({ imageUrl, name, linkUrl, className = '' }: SponsorLogoProps) {
  const image = (
    <div
      className={`group relative flex items-center justify-center p-4 transition-all duration-500 hover:scale-105 ${className}`}
    >
      <div className="absolute inset-0 bg-white/[0.02] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <img
        src={imageUrl}
        alt={name}
        className="relative z-10 max-h-16 w-auto object-contain opacity-70 transition-all duration-500 group-hover:opacity-100 md:max-h-20"
        style={{ filter: 'grayscale(100%) brightness(1.5)' }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLImageElement).style.filter = 'grayscale(0%) brightness(1)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLImageElement).style.filter = 'grayscale(100%) brightness(1.5)';
        }}
      />
    </div>
  );

  if (linkUrl) {
    return (
      <a href={linkUrl} target="_blank" rel="nofollow noopener noreferrer">
        {image}
      </a>
    );
  }

  return image;
}
