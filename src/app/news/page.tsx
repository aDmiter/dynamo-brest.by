// src/app/news/page.tsx - Новости
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';

export default async function NewsPage() {
  const news = await prisma.news.findMany({
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-[#003366]">Новости</h1>

      {news.length === 0 ? (
        <p className="text-center text-gray-500">Новостей пока нет</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.slug}`}
              className="group rounded-xl bg-white shadow-md transition-shadow hover:shadow-lg"
            >
              {item.imageUrl && (
                <div className="relative h-48 overflow-hidden rounded-t-xl">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-4">
                <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                  <FontAwesomeIcon icon={faCalendarDays} />
                  {new Date(item.publishedAt).toLocaleDateString('ru-RU')}
                </div>
                <h2 className="mb-2 text-lg font-bold text-[#003366] group-hover:underline">
                  {item.title}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-3">{item.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
