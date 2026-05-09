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
      className="news__card group relative flex flex-col overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-500 hover:border-[#ee862c]/30 hover:bg-white/10 hover:shadow-2xl hover:shadow-[#ee862c]/5"
    >
      {/* Изображение */}
      <div className="news__card-image relative h-56 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#14516c]/20 text-gray-600">
            <span className="font-heading text-4xl">ДБ</span>
          </div>
        )}
        {/* Категория */}
        <span className="absolute left-3 top-3 bg-[#ee862c] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          {category}
        </span>
      </div>

      {/* Контент */}
      <div className="news__card-content flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
          <FontAwesomeIcon icon={faCalendarAlt} className="text-[10px]" />
          <span>{new Date(publishedAt).toLocaleDateString('ru-RU')}</span>
        </div>
        <h3 className="news__card-title mb-2 font-heading text-lg font-bold text-white transition-colors group-hover:text-[#ee862c] line-clamp-2">
          {title}
        </h3>
        <p className="news__card-excerpt mb-4 text-sm leading-relaxed text-gray-400 line-clamp-3">
          {excerpt}
        </p>
        <div className="mt-auto flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ee862c]">
          Читать
          <FontAwesomeIcon
            icon={faArrowRight}
            className="text-[10px] transition-transform group-hover:translate-x-1"
          />
        </div>
      </div>
    </Link>
  );
}
