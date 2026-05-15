// src/app/news/[slug]/page.tsx - Страница отдельной новости
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { socialLinks } from '@/modules/config/social';

const categoryLabels: Record<string, string> = {
  general: 'Общее',
  polls: 'Опросы',
  events: 'События',
  press: 'Пресса',
  youth: 'Дубль',
  academy: 'Академия',
  club: 'Клуб',
  partners: 'Партнёры',
  shop: 'Магазин',
  tickets: 'Билеты',
  video: 'Видео',
  school: 'Школа',
  'first-team': 'Основной состав',
  interviews: 'Интервью',
  season: 'Сезон',
  transfers: 'Трансферы',
  friendly: 'Товарищеские матчи',
  cup: 'Кубок',
  history: 'История',
  women: 'Женская команда',
  eurocups: 'Еврокубки',
};

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
    <article className="news-article" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
      {/* Первый экран — картинка на всю высоту */}
      <section className="news-article__hero relative h-screen w-full overflow-hidden">
        <img
          src={article.imageUrl || '/images/placeholder.jpg'}
          alt={article.title}
          className="news-article__hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div className="news-article__hero-overlay absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />

        <div className="news-article__hero-content absolute inset-0 flex items-center">
          <div className="w-full pl-6 md:pl-36">
            <Link
              href="/news"
              className="news-article__back mb-6 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-[var(--color-accent)]"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
              Все новости
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div
                style={{
                  background: 'var(--color-accent-10)',
                  border: '1.5px solid var(--color-accent)',
                  borderRadius: 6,
                  padding: '4px 12px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--color-accent)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                {categoryLabels[article.category] || article.category}
              </div>
              <div
                style={{
                  height: 1,
                  width: 32,
                  background: 'linear-gradient(to right, var(--color-accent-30), transparent)',
                }}
              />
            </div>

            <h1
              className="news-article__title max-w-3xl text-4xl leading-[0.92] text-white md:text-6xl lg:text-7xl"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontWeight: 900,
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
              }}
            >
              {article.title}
            </h1>

            <p className="news-article__date mt-6 flex items-center gap-2 text-sm text-white/50">
              <FontAwesomeIcon icon={faCalendarAlt} style={{ color: 'var(--color-accent)' }} />
              {new Date(article.publishedAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              {' | '}
              {new Date(article.publishedAt).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Соцсети */}
        <div className="news-article__social absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-6 md:flex">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="text-white/50 transition-colors hover:text-[var(--color-accent)]"
            >
              <FontAwesomeIcon icon={social.icon} className="text-lg" />
            </a>
          ))}
          <div className="h-12 w-[1px] bg-white/20" />
        </div>

        <div className="news-article__scroll absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-white/60">
            <span className="text-[10px] uppercase tracking-[0.4em]">Читать</span>
            <div className="h-12 w-[1px] bg-white/30" />
          </div>
        </div>
      </section>

      {/* Текст новости */}
      <section className="news-article__content relative flex min-h-screen items-center bg-white">
        <div className="container mx-auto max-w-[1200px] px-4 py-16 md:px-8 md:ml-20">
          <div
            className="news-article__body prose max-w-none prose-headings:font-heading prose-headings:text-[#242C41] prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[var(--color-accent)] prose-img:max-w-full"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        <div className="news-article__title-module absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none">
          <span
            className="block text-[80px] font-black uppercase tracking-[0.1em] md:text-[120px] leading-none"
            style={{
              writingMode: 'vertical-lr',
              transform: 'rotate(180deg)',
              fontFamily: "'Inter Tight', sans-serif",
              fontWeight: 900,
              color: 'var(--color-team-names)',
              opacity: 0.1,
            }}
          >
            НОВОСТИ
          </span>
        </div>
      </section>
    </article>
  );
}
