// src/app/page/[slug]/page.tsx — текстовая страница из главного меню (паттерн CMSTextPage)
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsTextPage from '@/modules/shared/ui/CmsTextPage';
import { resolveMainMenuTextPageUrl } from '@/lib/cms-text-page-paths';
import { resolveSiteMetadata } from '@/lib/site-page-meta';
import { getLocalizedMainMenuPage } from '@/lib/cms-page-localized';

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

  const page = await getLocalizedMainMenuPage(slug);
  if (!page) notFound();

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
