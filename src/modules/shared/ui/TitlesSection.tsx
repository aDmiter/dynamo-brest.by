// src/modules/shared/ui/TitlesSection.tsx - Секция титулов клуба
import { prisma } from '@/lib/prisma';

const titleConfig = [
  {
    type: 'championship',
    name: 'Чемпионат',
    image: '/images/cup3.png',
  },
  {
    type: 'cup',
    name: 'Кубок',
    image: '/images/cup2.png',
  },
  {
    type: 'supercup',
    name: 'Суперкубок',
    image: '/images/cup1.png',
  },
];

export default async function TitlesSection() {
  const titles = await prisma.title.findMany({
    orderBy: { year: 'desc' },
  });

  const titleData = titleConfig.map((config) => {
    const items = titles.filter((t) => t.type === config.type);
    const years = items.map((t) => t.year).sort((a, b) => b - a);
    return {
      ...config,
      count: items.length,
      years: years.join(', '),
    };
  });

  return (
    <section className="titles relative flex min-h-screen items-center overflow-hidden">
      <div className="titles__background absolute inset-0">
        <img src="/images/titles_bg.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F1C]/90 via-[#0D1225]/80 to-[#0F1529]/90" />
      </div>

      <div className="titles__container relative z-10 mx-auto w-full max-w-[900px] px-4 py-16 md:px-8">
        <div className="titles__grid grid grid-cols-3 items-end gap-6 md:gap-10">
          {titleData.map((title) => (
            <div
              key={title.type}
              className="titles__item group flex flex-col items-center text-center"
            >
              <div className="titles__card flex h-full w-full flex-col items-center">
                <div className="titles__cup relative mb-6 w-32 transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-4 md:w-40">
                  <div className="titles__glow absolute inset-0 scale-75 rounded-full bg-[#ee862c]/10 blur-3xl transition-all duration-1000 group-hover:bg-[#ee862c]/20 group-hover:scale-100" />
                  <div
                    className="titles__shine absolute left-1/4 top-0 h-1/3 w-1/3 bg-gradient-to-b from-white/30 to-transparent opacity-0 transition-opacity duration-1000 group-hover:opacity-100"
                    style={{ transform: 'skewX(-30deg)' }}
                  />
                  <img
                    src={title.image}
                    alt={title.name}
                    className="titles__cup-image relative z-10 w-full drop-shadow-2xl transition-all duration-700 group-hover:drop-shadow-[0_0_30px_rgba(238,134,44,0.3)]"
                    style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}
                  />
                </div>
                <div className="titles__info w-full border border-white/10 bg-white/5 backdrop-blur-md px-4 py-4 transition-all duration-500 group-hover:border-[#ee862c]/20 group-hover:bg-white/[0.07] group-hover:shadow-2xl group-hover:shadow-[#ee862c]/5">
                  <h3
                    className="titles__name text-base font-bold text-white md:text-lg"
                    style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
                  >
                    {title.name}
                  </h3>
                  <div className="titles__count mt-1 flex justify-center">
                    <span
                      className="text-4xl font-black text-[#ee862c] md:text-5xl"
                      style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
                    >
                      {title.count}
                    </span>
                  </div>
                  <p className="titles__years mt-2 text-xs text-gray-400">{title.years}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="titles__stripe mx-auto mt-16 h-[1px] w-32 bg-gradient-to-r from-transparent via-[#ee862c]/50 to-transparent" />
      </div>

      <div className="titles__title-module absolute left-0 bottom-0 pointer-events-none select-none">
        <span
          className="block text-[60px] font-black uppercase tracking-[0.1em] text-white/[0.07] md:text-[100px] leading-none"
          style={{
            writingMode: 'vertical-lr',
            transform: 'rotate(180deg)',
            fontFamily: "'Inter Tight', sans-serif",
            fontWeight: 900,
          }}
        >
          ТИТУЛЫ
        </span>
      </div>
    </section>
  );
}
