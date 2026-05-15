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
import { faShirt, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default async function Home() {
  const featuredNews = await prisma.news.findMany({
    where: { isFeatured: true, isPublished: true },
    orderBy: { publishedAt: 'desc' },
    take: 5,
    select: { id: true, title: true, slug: true, imageUrl: true, category: true },
  });

  const latestNews = await prisma.news.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
    take: 20,
    select: { id: true, title: true, slug: true, imageUrl: true },
  });

  const banner = await prisma.banner.findFirst({
    where: { isActive: true, position: 'home' },
    orderBy: { createdAt: 'desc' },
  });

  const featuredProducts = await prisma.product.findMany({
    where: { inStock: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
    include: { productcategory: true },
  });

  return (
    <ScrollSnapWrapper>
      <div>
        <HeroSlider featuredNews={featuredNews} />
        <NewsCarousel news={latestNews} />
        <MatchSection />

        {banner ? (
          <AdBanner
            title={banner.title}
            imageUrl={banner.imageUrl}
            linkUrl={banner.linkUrl}
            backgroundUrl={banner.backgroundUrl}
            bannerId={banner.id}
          />
        ) : (
          <section
            className="banner relative flex h-screen items-center justify-center"
            style={{ background: 'var(--color-bg-main)' }}
          >
            <div className="banner__container relative z-10 text-center px-4">
              <p
                className="text-sm font-medium uppercase tracking-[0.3em]"
                style={{ color: 'var(--color-accent)' }}
              >
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

        {/* Товары магазина */}

        <section className="shop relative flex min-h-screen flex-col bg-white">
          <div className="shop__products flex flex-1 flex-col md:flex-row">
            {featuredProducts.length === 0
              ? [1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="shop__product group relative flex flex-1 items-center justify-center border-r border-b border-gray-200 transition-colors hover:bg-gray-50"
                  >
                    <div className="text-center p-8">
                      <FontAwesomeIcon
                        icon={faShirt}
                        className="mb-6 text-6xl"
                        style={{ color: 'var(--color-accent)' }}
                      />
                      <p className="font-heading text-lg font-bold uppercase tracking-wider text-[#242C41]">
                        Товар {item}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">Скоро в продаже</p>
                      <p
                        className="mt-4 font-heading text-3xl font-bold"
                        style={{ color: 'var(--color-accent)' }}
                      >
                        —
                      </p>
                    </div>
                  </div>
                ))
              : featuredProducts.map((product) => {
                  const images: string[] = product.images ? JSON.parse(product.images) : [];
                  const hasDiscount =
                    product.oldPrice && Number(product.oldPrice) > Number(product.price);
                  return (
                    <Link
                      key={product.id}
                      href={`/shop/product/${product.slug}`}
                      className="shop__product group relative flex flex-1 border-r border-b border-gray-200 overflow-hidden"
                    >
                      {images[0] ? (
                        <img
                          src={images[0]}
                          alt={product.name}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                          <FontAwesomeIcon icon={faShirt} className="text-6xl text-gray-300" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-8 pt-24">
                        <p className="font-heading text-xl font-bold uppercase tracking-wider text-white line-clamp-2">
                          {product.name}
                        </p>
                        {hasDiscount ? (
                          <div className="mt-2">
                            <p className="font-heading text-2xl font-bold text-red-500">
                              {Number(product.price).toFixed(2)} BYN
                            </p>
                            <p className="text-sm text-white/50 line-through">
                              {Number(product.oldPrice).toFixed(2)} BYN
                            </p>
                          </div>
                        ) : (
                          <p
                            className="mt-2 font-heading text-2xl font-bold"
                            style={{ color: 'var(--color-accent)' }}
                          >
                            {Number(product.price).toFixed(2)} BYN
                          </p>
                        )}
                        <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/70 transition-colors group-hover:text-[var(--color-accent)]">
                          Подробнее
                          <FontAwesomeIcon
                            icon={faArrowRight}
                            className="text-xs transition-transform group-hover:translate-x-1"
                          />
                        </span>
                      </div>
                    </Link>
                  );
                })}
          </div>

          <div className="shop__footer flex items-center justify-between bg-[#F5F5F5] px-8 py-6">
            <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-[#242C41]">
              <FontAwesomeIcon
                icon={faShirt}
                className="mr-3"
                style={{ color: 'var(--color-accent)' }}
              />{' '}
              Магазин
            </h2>
            <Link
              href="/shop/catalog"
              className="text-sm font-medium uppercase tracking-wider"
              style={{ color: 'var(--color-accent)' }}
            >
              Все товары →
            </Link>
          </div>

          <div className="shop__title absolute left-0 bottom-0 pointer-events-none select-none">
            <span
              className="block text-[80px] font-black uppercase tracking-[0.1em] text-[#a5b3d5]/20 md:text-[120px] leading-none"
              style={{
                writingMode: 'vertical-lr',
                transform: 'rotate(180deg)',
                fontFamily: "'Inter Tight', sans-serif",
                fontWeight: 900,
              }}
            >
              МАГАЗИН
            </span>
          </div>
        </section>

        <VideoSection />
        <TitlesSection />
      </div>
    </ScrollSnapWrapper>
  );
}
