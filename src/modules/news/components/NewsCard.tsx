// src/modules/news/components/NewsCard.tsx - Карточка новости
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faArrowRight } from '@fortawesome/free-solid-svg-icons';

interface NewsCardProps {
  slug: string;
  title: string;
  excerpt: string;
  imageUrl?: string | null;
  publishedAt: Date;
  category: string;
}

export default function NewsCard({
  slug,
  title,
  excerpt,
  imageUrl,
  publishedAt,
  category,
}: NewsCardProps) {
  return (
    <Link
      href={`/news/${slug}`}
      className="news__card group relative flex flex-col overflow-hidden transition-all duration-300"
      style={{
        borderRadius: 16,
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg-card)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
        textDecoration: 'none',
        color: 'inherit',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = 'translateY(-6px) scale(1.01)';
        el.style.borderColor = 'var(--color-accent-30)';
        el.style.boxShadow = '0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px var(--color-accent-20)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = 'translateY(0) scale(1)';
        el.style.borderColor = 'var(--color-border)';
        el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.35)';
      }}
    >
      {/* Изображение */}
      <div className="news__card-image relative overflow-hidden" style={{ paddingBottom: '60%' }}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'var(--color-bg-photo-placeholder)' }}
          >
            <img
              src="/images/placeholder.jpg"
              alt="Placeholder"
              className="h-full w-full object-cover opacity-50"
            />
          </div>
        )}
        {/* Категория */}
        <span
          className="absolute left-3 top-3 z-10"
          style={{
            background: 'var(--color-accent-10)',
            border: '1.5px solid var(--color-accent)',
            borderRadius: 6,
            padding: '3px 9px',
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--color-accent)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        >
          {category}
        </span>
      </div>

      {/* Контент */}
      <div
        className="news__card-content flex flex-1 flex-col p-5"
        style={{ background: 'var(--color-bg-main)' }}
      >
        <div
          className="mb-3 flex items-center gap-2 text-xs"
          style={{ color: 'var(--color-text-stat)' }}
        >
          <FontAwesomeIcon
            icon={faCalendarAlt}
            className="text-[10px] text-[var(--color-accent)]"
          />
          <span>{new Date(publishedAt).toLocaleDateString('ru-RU')}</span>
        </div>

        <h3
          className="news__card-title mb-2 line-clamp-2 transition-colors group-hover:text-[var(--color-accent)]"
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 'clamp(16px, 1.8vw, 20px)',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            lineHeight: 1.2,
            textTransform: 'uppercase',
          }}
        >
          {title}
        </h3>

        <p
          className="news__card-excerpt mb-4 line-clamp-3"
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 13,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.5,
          }}
        >
          {excerpt}
        </p>

        <div className="mt-auto">
          <div
            style={{
              height: 1,
              width: 36,
              background: 'linear-gradient(to right, var(--color-accent-30), transparent)',
              marginBottom: 8,
            }}
          />
          <div
            className="flex items-center gap-2 transition-all group-hover:gap-3"
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--color-accent)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Читать
            <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
          </div>
        </div>
      </div>
    </Link>
  );
}
