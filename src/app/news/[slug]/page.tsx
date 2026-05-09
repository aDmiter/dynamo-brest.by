// src/app/news/[slug]/page.tsx - Страница отдельной новости
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faFolder, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function NewsArticlePage({ params }: Props) {
  const { slug } = await params;

  const article = await prisma.news.findUnique({ where: { slug } });

  if (!article || !article.isPublished) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-16 md:ml-20">
      {/* Назад */}
      <Link
        href="/news"
        className="mb-8 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-[#ee862c]"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
        Все новости
      </Link>

      {/* Изображение */}
      {article.imageUrl && (
        <div className="news__article-image mb-10 overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full max-h-[500px] object-cover"
          />
        </div>
      )}

      {/* Мета */}
      <div className="news__article-meta mb-4 flex items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faCalendarAlt} />
          {new Date(article.publishedAt).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
        <span className="flex items-center gap-2">
          <FontAwesomeIcon icon={faFolder} />
          {article.category}
        </span>
      </div>

      {/* Заголовок */}
      <h1 className="news__article-title mb-8 font-heading text-3xl font-bold text-white md:text-5xl">
        {article.title}
      </h1>

      {/* Контент */}
      <div
        className="news__article-content prose prose-invert max-w-none prose-headings:font-heading prose-a:text-[#ee862c] prose-p:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </div>
  );
}
