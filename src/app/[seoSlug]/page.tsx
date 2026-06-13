import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSitePageAliasMaps, resolveSiteMetadata } from '@/lib/site-page-meta';
import { renderSeoAliasPage } from '@/lib/seo-alias-render';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ seoSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { seoSlug } = await params;
  const publicPath = `/${seoSlug}`;
  const { aliasToPath } = await getSitePageAliasMaps();
  if (!aliasToPath.has(publicPath)) return {};
  return resolveSiteMetadata(publicPath);
}

export default async function SeoAliasPublicPage({ params }: Props) {
  const { seoSlug } = await params;
  const publicPath = `/${seoSlug}`;
  const { aliasToPath } = await getSitePageAliasMaps();
  const internalPath = aliasToPath.get(publicPath);
  if (!internalPath) notFound();

  return renderSeoAliasPage(internalPath);
}
