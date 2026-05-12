// src/app/admin/news/page.tsx - Управление новостями с пагинацией
import { prisma } from '@/lib/prisma';
import NewsAdminClient from './NewsAdminClient';

export default async function NewsAdminPage() {
  const total = await prisma.news.count();

  // Первая страница
  const news = await prisma.news.findMany({
    orderBy: { publishedAt: 'desc' },
    take: 50,
    skip: 0,
  });

  const serializedNews = news.map((item) => ({
    ...item,
    publishedAt: item.publishedAt.toISOString(),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-white">Новости</h1>
      </div>
      <NewsAdminClient initialNews={serializedNews} initialTotal={total} />
    </div>
  );
}
