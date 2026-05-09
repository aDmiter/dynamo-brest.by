// src/app/page.tsx - Главная страница
import { prisma } from '@/lib/prisma';
import HeroSlider from '@/modules/shared/ui/HeroSlider';
import MatchSection from '@/modules/shared/ui/MatchSection';
import AdBanner from '@/modules/shared/ui/AdBanner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faShirt } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default async function Home() {
  // Получаем активный баннер
  const banner = await prisma.banner.findFirst({
    where: { isActive: true, position: 'home' },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <HeroSlider />
      <MatchSection />

      {/* Рекламный баннер */}
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
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#ee862c]">Реклама</p>
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

      {/* Видео + Титулы */}
      <section className="flex min-h-screen flex-col md:flex-row">
        <div className="flex flex-1 flex-col items-center justify-center bg-[#242C41] p-8">
          <FontAwesomeIcon icon={faTrophy} className="mb-6 text-6xl text-[#ee862c]" />
          <h2 className="font-heading text-3xl font-bold text-white">Последние видео</h2>
          <p className="mt-4 text-gray-400">Подписывайтесь на наш YouTube канал</p>
          <button className="mt-8 border border-gray-600 px-10 py-4 text-sm font-medium uppercase tracking-wider text-gray-300 transition-colors hover:border-[#ee862c] hover:text-[#ee862c]">
            Смотреть все
          </button>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center bg-[#14516c] p-8">
          <FontAwesomeIcon icon={faTrophy} className="mb-6 text-6xl text-[#ee862c]" />
          <h2 className="font-heading text-3xl font-bold text-white">Титулы клуба</h2>
          <div className="mt-8 grid grid-cols-2 gap-6">
            <div className="text-center">
              <p className="font-heading text-5xl font-bold text-white">1</p>
              <p className="mt-2 text-sm text-white/70">Чемпион Беларуси</p>
              <p className="text-xs text-white/50">2019</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-5xl font-bold text-white">3</p>
              <p className="mt-2 text-sm text-white/70">Кубок Беларуси</p>
              <p className="text-xs text-white/50">2007, 2017, 2018</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-5xl font-bold text-white">2</p>
              <p className="mt-2 text-sm text-white/70">Суперкубок</p>
              <p className="text-xs text-white/50">2018, 2019</p>
            </div>
            <div className="text-center">
              <p className="font-heading text-5xl font-bold text-white">1</p>
              <p className="mt-2 text-sm text-white/70">Кубок Федерации</p>
              <p className="text-xs text-white/50">2007</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
