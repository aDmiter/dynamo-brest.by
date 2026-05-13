// src/app/layout.tsx - Корневой layout
import type { Metadata } from 'next';
import '@/lib/fontawesome';
import '@/styles/globals.scss';
import Header from '@/modules/shared/ui/Header';
import Footer from '@/modules/shared/ui/Footer';
import { headers } from 'next/headers';
import BurgerMenu from '@/modules/shared/ui/BurgerMenu';

export const metadata: Metadata = {
  title: 'Динамо-Брест',
  description: 'Официальный сайт футбольного клуба «Динамо-Брест»',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Определяем, является ли страница админкой
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  const isAdmin = pathname.startsWith('/admin');

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
        {!isAdmin && <Header />}
        {!isAdmin && <BurgerMenu />}
        <main>{children}</main>
        {!isAdmin && <Footer />}
      </body>
    </html>
  );
}
