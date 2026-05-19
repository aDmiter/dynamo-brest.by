// src/app/page/[slug]/page.tsx — текстовая страница из главного меню (паттерн CMSTextPage)
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CmsTextPage from '@/modules/shared/ui/CmsTextPage';
import { resolveMainMenuTextPageUrl } from '@/lib/cms-text-page-paths';
import { resolveSiteMetadata } from '@/lib/site-page-meta';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return resolveSiteMetadata(resolveMainMenuTextPageUrl(slug), {
    title: 'Динамо-Брест',
  });
}

export default async function MenuPage({ params }: Props) {
  const { slug } = await params;

  const page = await prisma.menuitem.findUnique({
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
    />
  );
}
