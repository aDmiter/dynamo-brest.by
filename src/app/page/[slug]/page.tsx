// src/app/page/[slug]/page.tsx - Отображение текстовой страницы из меню
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function MenuPage({ params }: Props) {
  const { slug } = await params;

  const page = await prisma.menuitem.findUnique({
    where: { slug },
  });

  if (!page || page.type !== 'page' || !page.isActive) {
    notFound();
  }

  return (
    <article className="min-h-screen bg-white">
      {/* Hero-секция */}
      <section className="relative h-[50vh] w-full overflow-hidden">
        <img
          src="/images/stadium.jpg"
          alt={page.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="absolute inset-0 flex items-center">
          <div className="w-full pl-6 md:pl-36">
            <h1
              className="text-4xl leading-tight text-white md:text-5xl lg:text-6xl"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
            >
              {page.title}
            </h1>
            <p className="mt-4 flex items-center gap-2 text-sm text-white/50">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-[#ee862c]" />
              Обновлено:{' '}
              {new Date(page.updatedAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Контент */}
      <section className="relative py-16">
        <div className="container mx-auto max-w-[900px] px-4 md:px-8 md:ml-20">
          {page.pageContent ? (
            <div
              className="prose max-w-none prose-headings:font-heading prose-headings:text-[#242C41] prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#ee862c]"
              dangerouslySetInnerHTML={{ __html: page.pageContent }}
            />
          ) : (
            <div className="text-center py-20">
              <p className="text-xl text-gray-400">Содержимое страницы в разработке</p>
            </div>
          )}
        </div>
      </section>
    </article>
  );
}
