// src/app/page.tsx - Главная страница
import { prisma } from '@/lib/prisma';
import { withDb } from '@/lib/with-db';
import HeroSlider from '@/modules/shared/ui/HeroSlider';
import NewsCarousel from '@/modules/news/components/NewsCarousel';
import MatchSection from '@/modules/shared/ui/MatchSection';
import AdBanner from '@/modules/shared/ui/AdBanner';
import VideoSection from '@/modules/shared/ui/VideoSection';
import TitlesSection from '@/modules/shared/ui/TitlesSection';
import HomeShopSection from '@/modules/shop/components/HomeShopSection';
import type { CatalogProductCardData } from '@/modules/shop/components/CatalogProductCard';
import { getSiteLangFromCookies } from '@/lib/content-translations-server';
import {
  loadBeTranslationsMap,
  localizeNewsRecord,
  localizeProducts,
} from '@/lib/content-translations';

export default async function Home() {
  const lang = await getSiteLangFromCookies();

  const { featuredNews, latestNews, banner, featuredProducts } = await withDb(
    async () => {
      const [featuredNews, latestNews, banner, featuredProducts] = await Promise.all([
        prisma.news.findMany({
          where: { isFeatured: true, isPublished: true },
          orderBy: { publishedAt: 'desc' },
          take: 5,
          select: { id: true, title: true, slug: true, imageUrl: true, category: true },
        }),
        prisma.news.findMany({
          where: { isPublished: true },
          orderBy: { publishedAt: 'desc' },
          take: 20,
          select: { id: true, title: true, slug: true, imageUrl: true },
        }),
        prisma.banner.findFirst({
          where: { isActive: true, position: 'home' },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.product.findMany({
          where: { inStock: true, isFeatured: true },
          orderBy: [{ isHit: 'desc' }, { createdAt: 'desc' }],
          take: 4,
          include: { productcategory: { select: { id: true, name: true } }, manufacturer: { select: { name: true } } },
        }),
      ]);
      return { featuredNews, latestNews, banner, featuredProducts };
    },
    { featuredNews: [], latestNews: [], banner: null, featuredProducts: [] },
    'home',
  );

  let localizedFeatured = featuredNews;
  let localizedLatest = latestNews;
  if (lang === 'be') {
    const ids = [...new Set([...featuredNews, ...latestNews].map((n) => n.id))];
    const tr = await loadBeTranslationsMap('news', ids);
    localizedFeatured = featuredNews.map((n) => localizeNewsRecord(n, lang, tr));
    localizedLatest = latestNews.map((n) => localizeNewsRecord(n, lang, tr));
  }

  const localizedFeaturedProducts =
    lang === 'be' ? await localizeProducts(featuredProducts, lang) : featuredProducts;

  const shopProducts: CatalogProductCardData[] = localizedFeaturedProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price.toString(),
    oldPrice: p.oldPrice?.toString() ?? null,
    images: p.images,
    isHit: p.isHit,
    productcategory: p.productcategory,
    manufacturer: p.manufacturer,
  }));

  return (
    <>
      <HeroSlider featuredNews={localizedFeatured} />
      <NewsCarousel news={localizedLatest} />
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

      <HomeShopSection products={shopProducts} />

      <VideoSection />
      <TitlesSection />
    </>
  );
}
