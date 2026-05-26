// src/app/legal/[slug]/page.tsx — текстовая страница из нижнего меню (паттерн CMSTextPage)
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CmsTextPage from '@/modules/shared/ui/CmsTextPage';
import { resolveFooterMenuTextPageUrl } from '@/lib/cms-text-page-paths';
import { resolveSiteMetadata } from '@/lib/site-page-meta';
import { getLocalizedFooterMenuPage } from '@/lib/cms-page-localized';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return resolveSiteMetadata(resolveFooterMenuTextPageUrl(slug), {
    title: 'Динамо-Брест',
  });
}

export default async function LegalPage({ params }: Props) {
  const { slug } = await params;

  const page = await getLocalizedFooterMenuPage(slug);
  if (!page) notFound();

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
