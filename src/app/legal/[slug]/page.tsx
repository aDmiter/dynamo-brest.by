// src/app/legal/[slug]/page.tsx — текстовая страница из нижнего меню
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CompactPageHero from '@/modules/shared/ui/CompactPageHero';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;

  const page = await prisma.footermenuitem.findUnique({
    where: { slug },
  });

  if (!page || !page.isActive || page.type !== 'page') {
    notFound();
  }

  return (
    <article className="legal-page">
      <div
        style={{
          background: 'var(--color-bg-main)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <CompactPageHero subtitle="Динамо-Брест" title={page.title} watermark="legal" />
      </div>

      <section className="legal-page__content">
        <div className="legal-page__container">
          {page.pageContent ? (
            <div
              className="legal-page__body prose max-w-none"
              dangerouslySetInnerHTML={{ __html: page.pageContent }}
            />
          ) : (
            <p className="legal-page__empty">Содержимое страницы в разработке</p>
          )}
        </div>
      </section>
    </article>
  );
}
