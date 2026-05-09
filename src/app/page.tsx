// src/app/page.tsx - Главная страница
import { prisma } from '@/lib/prisma';
import ScrollSnapWrapper from '@/modules/shared/ui/ScrollSnapWrapper';
import HeroSlider from '@/modules/shared/ui/HeroSlider';
import NewsCarousel from '@/modules/news/components/NewsCarousel';
import MatchSection from '@/modules/shared/ui/MatchSection';
import AdBanner from '@/modules/shared/ui/AdBanner';
import VideoSection from '@/modules/shared/ui/VideoSection';
import TitlesSection from '@/modules/shared/ui/TitlesSection';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShirt } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default async function Home() {
  // 5 последних избранных новостей для слайдера
  const featuredNews = await prisma.news.findMany({
    where: { isFeatured: true, isPublished: true },
    orderBy: { publishedAt: 'desc' },
    take: 5,
    select: { id: true, title: true, slug: true, imageUrl: true, category: true },
  });

  // 20 последних новостей для карусели
  const latestNews = await prisma.news.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    select: { id: true, title: true, slug: true, imageUrl: true },
  });

  // Активный баннер
  const banner = await prisma.banner.findFirst({
    where: { isActive: true, position: 'home' },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <ScrollSnapWrapper>
      <div>
        {/* Секция 1: Слайдер */}
        <HeroSlider featuredNews={featuredNews} />

        {/* Секция 2: Карусель новостей */}
        <NewsCarousel news={latestNews} />

        {/* Секция 3: Матчи */}
        <MatchSection />

        {/* Секция 4: Рекламный баннер */}
        {banner ? (
          <AdBanner
            title={banner.title}
            imageUrl={banner.imageUrl}
            linkUrl={banner.linkUrl}
            backgroundUrl={banner.backgroundUrl}
            bannerId={banner.id}
          />
        ) : (
          <section className="banner relative flex h-screen items-center justify-center bg-gradient-to-br from-[#0B0F1C] via-[#0D1225] to-[#0F1529]">
            <div className="banner__container relative z-10 text-center px-4">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#ee862c]">
                Реклама
              </p>
              <h2 className="mt-4 text-5xl font-bold text-white md:text-7xl">Ваш баннер здесь</h2>
              <p className="mt-4 text-lg text-gray-300">Добавьте баннер через админ-панель</p>
            </div>
            <div className="banner__title absolute left-0 bottom-0 pointer-events-none select-none">
              <span
                className="block text-[80px] font-black uppercase tracking-[0.1em] text-white/[0.15] md:text-[120px] leading-none"
                style={{
                  writingMode: 'vertical-lr',
                  transform: 'rotate(180deg)',
                  fontFamily: "'Inter Tight', sans-serif",
                  fontWeight: 900,
                }}
              >
                ПАРТНЁРЫ
              </span>
            </div>
          </section>
        )}

        {/* Секция 5: Товары магазина */}
        <section className="shop flex min-h-screen flex-col bg-white text-[#242C41]">
          <div className="shop__products flex flex-1 flex-col md:flex-row">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="shop__product group relative flex flex-1 items-center justify-center border-r border-b border-gray-200 p-8 transition-colors hover:bg-gray-50"
              >
                <div className="text-center">
                  <FontAwesomeIcon icon={faShirt} className="mb-6 text-6xl text-[#ee862c]" />
                  <p className="font-heading text-lg font-bold uppercase tracking-wider">
                    Товар {item}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">Категория</p>
                  <p className="mt-4 font-heading text-3xl font-bold text-[#ee862c]">99.00 BYN</p>
                  <button className="mt-6 border border-[#242C41] px-8 py-3 text-sm font-medium uppercase tracking-wider transition-colors hover:bg-[#242C41] hover:text-white">
                    В корзину
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="shop__footer flex items-center justify-between bg-[#F5F5F5] px-8 py-6">
            <h2 className="font-heading text-xl font-bold uppercase tracking-wider">
              <FontAwesomeIcon icon={faShirt} className="mr-3 text-[#ee862c]" /> Магазин
            </h2>
            <Link
              href="/shop/catalog"
              className="text-sm font-medium uppercase tracking-wider text-[#ee862c] hover:underline"
            >
              Все товары →
            </Link>
          </div>
        </section>

        {/* Секция 6: FCDBTV */}
        <VideoSection />

        {/* Секция 7: Титулы */}
        <TitlesSection />
      </div>
    </ScrollSnapWrapper>
  );
}
