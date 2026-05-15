// src/modules/shared/ui/TitlesSection.tsx - Секция титулов клуба
import { prisma } from '@/lib/prisma';
import TitlesCard from './TitlesCard';

const titleConfig = [
  { type: 'championship', name: 'Чемпионат', image: '/images/cup3.png' },
  { type: 'cup', name: 'Кубок', image: '/images/cup2.png' },
  { type: 'supercup', name: 'Суперкубок', image: '/images/cup1.png' },
];

export default async function TitlesSection() {
  const titles = await prisma.title.findMany({
    orderBy: { year: 'desc' },
  });

  const titleData = titleConfig.map((config) => {
    const items = titles.filter((t) => t.type === config.type);
    const years = items.map((t) => t.year).sort((a, b) => b - a);
    return { ...config, count: items.length, years: years.join(', ') };
  });

  return (
    <section
      className="titles relative flex min-h-screen items-center overflow-hidden"
      style={{ background: 'var(--color-bg-main)', fontFamily: "'Inter Tight', sans-serif" }}
    >
      <div className="titles__container relative z-10 mx-auto w-full max-w-[900px] px-4 py-16 md:px-8">
        <div className="titles__grid grid grid-cols-3 items-end gap-6 md:gap-10">
          {titleData.map((title) => (
            <TitlesCard key={title.type} title={title} />
          ))}
        </div>
        <div
          className="titles__stripe mx-auto mt-16 h-[1px] w-32"
          style={{
            background:
              'linear-gradient(to right, transparent, var(--color-accent-30), transparent)',
          }}
        />
      </div>

      <div className="titles__title-module absolute left-0 bottom-0 pointer-events-none select-none">
        <span
          className="block text-[60px] font-black uppercase tracking-[0.1em] md:text-[100px] leading-none"
          style={{
            writingMode: 'vertical-lr',
            transform: 'rotate(180deg)',
            fontFamily: "'Inter Tight', sans-serif",
            fontWeight: 900,
            color: 'var(--color-team-names)',
            opacity: 0.07,
          }}
        >
          ТИТУЛЫ
        </span>
      </div>
    </section>
  );
}
