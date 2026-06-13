import type { ComponentType } from 'react';
import { notFound } from 'next/navigation';
import CmsTextPage from '@/modules/shared/ui/CmsTextPage';
import { getLocalizedFooterMenuPage, getLocalizedMainMenuPage } from '@/lib/cms-page-localized';

type PageModule = { default: ComponentType<Record<string, never>> };

const SEO_PAGE_IMPORTS: Record<string, () => Promise<PageModule>> = {
  '/page/tickets': () => import('@/app/page/tickets/page'),
  '/club/history': () => import('@/app/club/history/page'),
  '/club/about': () => import('@/app/club/about/page'),
  '/club/administration': () => import('@/app/club/administration/page'),
  '/club/contacts': () => import('@/app/club/contacts/page'),
  '/club/partners': () => import('@/app/club/partners/page'),
  '/club/stadium': () => import('@/app/club/stadium/page'),
  '/school/coaches': () => import('@/app/school/coaches/page'),
  '/school/about': () => import('@/app/school/about/page'),
  '/school/join': () => import('@/app/school/join/page'),
  '/school/tournaments': () => import('@/app/school/tournaments/page'),
  '/school/teams': () => import('@/app/school/teams/page'),
  '/services/transport': () => import('@/app/services/transport/page'),
  '/services/fields': () => import('@/app/services/fields/page'),
  '/services/cafe': () => import('@/app/services/cafe/page'),
  '/services/hotel': () => import('@/app/services/hotel/page'),
  '/services/gym': () => import('@/app/services/gym/page'),
  '/shop/catalog': () => import('@/app/shop/catalog/page'),
  '/shop/cart': () => import('@/app/shop/cart/page'),
  '/shop/checkout': () => import('@/app/shop/checkout/page'),
  '/shop/checkout/success': () => import('@/app/shop/checkout/success/page'),
  '/shop/delivery': () => import('@/app/shop/delivery/page'),
  '/shop/payment': () => import('@/app/shop/payment/page'),
  '/shop/returns': () => import('@/app/shop/returns/page'),
  '/fans': () => import('@/app/fans/page'),
  '/media/press': () => import('@/app/media/press/page'),
  '/media/anthems': () => import('@/app/media/anthems/page'),
  '/news': () => import('@/app/news/page'),
};

export async function renderSeoAliasPage(internalPath: string) {
  const loader = SEO_PAGE_IMPORTS[internalPath];
  if (loader) {
    const { default: Page } = await loader();
    return <Page />;
  }

  const menuSlug = internalPath.match(/^\/page\/([^/]+)$/)?.[1];
  if (menuSlug) {
    const page = await getLocalizedMainMenuPage(menuSlug);
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

  const legalSlug = internalPath.match(/^\/legal\/([^/]+)$/)?.[1];
  if (legalSlug) {
    const page = await getLocalizedFooterMenuPage(legalSlug);
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

  notFound();
}
