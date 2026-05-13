// src/app/page/[slug]/page.tsx - Текстовая страница из меню
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { socialLinks } from '@/modules/config/social';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function MenuPage({ params }: Props) {
  const { slug } = await params;

  const page = await prisma.menuitem.findUnique({
    where: { slug },
  });

  if (!page || !page.isActive) {
    notFound();
  }

  const subtitle = page.subtitle || 'Динамо-Брест';

  return (
    <article className="menu-page">
      {/* Hero-секция на весь экран */}
      <section className="menu-page__hero relative h-screen w-full overflow-hidden">
        <img
          src={page.imageUrl || '/images/placeholder.jpg'}
          alt={page.title}
          className="menu-page__hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div className="menu-page__hero-overlay absolute inset-0 bg-black/50" />

        <div className="menu-page__hero-content absolute inset-0 flex items-center">
          <div className="w-full pl-6 md:pl-36">
            <p className="menu-page__category mb-4 text-sm font-bold uppercase tracking-[0.3em] text-[#ee862c]">
              {subtitle}
            </p>
            <h1
              className="menu-page__title max-w-3xl text-4xl leading-tight text-white md:text-6xl lg:text-7xl"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
            >
              {page.title}
            </h1>
          </div>
        </div>

        {/* Социальные сети справа */}
        <div className="menu-page__social absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 flex-col items-center gap-6 md:flex">
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

        {/* Скролл-индикатор */}
        <div className="menu-page__scroll absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-white/60">
            <span className="text-[10px] uppercase tracking-[0.4em]">Читать</span>
            <div className="h-12 w-[1px] bg-white/30" />
          </div>
        </div>
      </section>

      {/* Контент страницы */}
      {page.type === 'page' && (
        <section className="menu-page__content relative flex min-h-screen items-center bg-white overflow-hidden">
          <div className="container mx-auto max-w-[1200px] px-4 py-16 md:px-8 md:ml-20">
            {page.pageContent ? (
              <div
                className="menu-page__body prose max-w-none prose-headings:font-heading prose-headings:text-[#242C41] prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#ee862c] prose-img:max-w-full"
                dangerouslySetInnerHTML={{ __html: page.pageContent }}
              />
            ) : (
              <div className="text-center py-20">
                <p className="text-xl text-gray-400">Содержимое страницы в разработке</p>
              </div>
            )}
          </div>

          {/* Название модуля — правый нижний угол, сверху вниз */}
          <div className="menu-page__title-module absolute right-0 bottom-0 pointer-events-none select-none">
            <span
              className="block text-[60px] font-black uppercase tracking-[0.1em] text-[#a5b3d5]/15 md:text-[80px] leading-none"
              style={{
                writingMode: 'vertical-lr',
                fontFamily: "'Inter Tight', sans-serif",
                fontWeight: 900,
              }}
            >
              {subtitle}
            </span>
          </div>
        </section>
      )}
    </article>
  );
}
