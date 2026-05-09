// src/app/layout.tsx - Корневой layout
import type { Metadata } from 'next';
import '@/lib/fontawesome';
import '@/styles/globals.scss';
import Header from '@/modules/shared/ui/Header';
import Footer from '@/modules/shared/ui/Footer';

export const metadata: Metadata = {
  title: 'Динамо-Брест',
  description: 'Официальный сайт футбольного клуба «Динамо-Брест»',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
