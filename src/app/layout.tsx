// src/app/layout.tsx - Корневой layout
import type { Metadata } from 'next';
import { after } from 'next/server';
import { redirect } from 'next/navigation';
import '@/lib/fontawesome';
import '@/styles/globals.scss';
import Header from '@/modules/shared/ui/Header';
import Footer from '@/modules/shared/ui/Footer';
import { headers } from 'next/headers';
import BurgerMenu from '@/modules/shared/ui/BurgerMenu';
import TicketBuyFabLoader from '@/modules/shared/ui/TicketBuyFabLoader';
import AfpTicketScript from '@/modules/shared/ui/AfpTicketScript';
import { TicketSaleframeModalProvider } from '@/modules/shared/ui/TicketSaleframeModalContext';
import ThemeInitializer from '@/modules/shared/ui/ThemeInitializer';
import { isTicketSaleframeModalSupportedHost } from '@/lib/ticket-frame-host';
import AnalyticsScripts from '@/modules/shared/ui/AnalyticsScripts';
import { getAllSettings } from '@/lib/settings';
import {
  DEFAULT_METADATA,
  getSitePageRedirect,
  recordSitePageVisit,
  resolveSiteMetadata,
} from '@/lib/site-page-meta';

function isPartialNavigationRequest(headersList: Headers): boolean {
  return (
    headersList.get('rsc') === '1' ||
    headersList.get('next-router-prefetch') === '1' ||
    headersList.get('purpose') === 'prefetch'
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') ?? '';

  if (pathname.startsWith('/admin')) {
    return { title: 'Админ-панель' };
  }

  if (!pathname || isPartialNavigationRequest(headersList)) {
    return DEFAULT_METADATA;
  }

  return resolveSiteMetadata(pathname, DEFAULT_METADATA);
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isAdmin = pathname.startsWith('/admin');
  const isPartialNav = isPartialNavigationRequest(headersList);

  if (!isAdmin && pathname && !isPartialNav) {
    const redirectTo = await getSitePageRedirect(pathname);
    if (redirectTo) redirect(redirectTo);

    after(() => recordSitePageVisit(pathname));
  }

  const settings = await getAllSettings();
  const host = headersList.get('host');
  const saleframeModalAllowed = isTicketSaleframeModalSupportedHost(host);

  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=Inter:wght@400;500;600;700&family=Jersey+10+Charted&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen bg-[#242C41] text-white antialiased"
        suppressHydrationWarning
      >
        <ThemeInitializer settings={settings} />
        <TicketSaleframeModalProvider value={saleframeModalAllowed}>
          {!isAdmin && <AnalyticsScripts />}
          {!isAdmin && <Header />}
          {!isAdmin && <BurgerMenu />}
          {!isAdmin && <TicketBuyFabLoader />}
          <main>{children}</main>
          {!isAdmin && <Footer />}
          {!isAdmin && <AfpTicketScript enabled={saleframeModalAllowed} />}
        </TicketSaleframeModalProvider>
      </body>
    </html>
  );
}
