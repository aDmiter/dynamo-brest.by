// src/app/layout.tsx - Корневой layout приложения
import type { Metadata } from 'next';
import '@/lib/fontawesome';
import '@/styles/globals.scss';
import Header from '@/modules/shared/ui/Header';
import Footer from '@/modules/shared/ui/Footer';

export const metadata: Metadata = {
  title: 'Динамо-Брест',
  description: 'Официальный сайт футбольного клуба «Динамо-Брест»',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="flex min-h-screen flex-col bg-white text-gray-900 antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
