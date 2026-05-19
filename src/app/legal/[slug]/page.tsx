// src/app/legal/[slug]/page.tsx — текстовая страница из нижнего меню (паттерн CMSTextPage)
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CmsTextPage from '@/modules/shared/ui/CmsTextPage';

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
    <CmsTextPage
      title={page.title}
      subtitle={page.subtitle}
      pageContent={page.pageContent}
      heroHeader={page.heroHeader}
      imageUrl={page.imageUrl}
      watermarkFallback="legal"
    />
  );
}
