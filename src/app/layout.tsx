// src/app/layout.tsx - Корневой layout
import type { Metadata } from 'next';
import '@/lib/fontawesome';
import '@/styles/globals.scss';
import Header from '@/modules/shared/ui/Header';
import Footer from '@/modules/shared/ui/Footer';
import { headers } from 'next/headers';
import BurgerMenu from '@/modules/shared/ui/BurgerMenu';
import TicketBuyFabLoader from '@/modules/shared/ui/TicketBuyFabLoader';
import ThemeInitializer from '@/modules/shared/ui/ThemeInitializer';
import AnalyticsScripts from '@/modules/shared/ui/AnalyticsScripts';

export const metadata: Metadata = {
  title: 'Официальный сайт футбольного клуба «Динамо-Брест»',
  description: 'Официальный сайт футбольного клуба «Динамо-Брест»',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isAdmin = pathname.startsWith('/admin');

  // Загружаем настройки цветов из БД
  let settings: Record<string, string> = {};
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/settings?full=1`, { next: { revalidate: 300 } });
    if (res.ok) {
      settings = await res.json();
    }
  } catch {
    // если не удалось — используем дефолтные из CSS
  }

  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=Inter:wght@400;500;600;700&family=Jersey+10+Charted&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#242C41] text-white antialiased">
        <ThemeInitializer settings={settings} />
        {!isAdmin && <AnalyticsScripts />}
        {!isAdmin && <Header />}
        {!isAdmin && <BurgerMenu />}
        {!isAdmin && <TicketBuyFabLoader />}
        <main>{children}</main>
        {!isAdmin && <Footer />}
      </body>
    </html>
  );
}
