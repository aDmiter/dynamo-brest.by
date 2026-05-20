// src/modules/shared/ui/TitlesSection.tsx - Секция титулов клуба
import { prisma } from '@/lib/prisma';
import { withDb } from '@/lib/with-db';
import TitlesCard from './TitlesCard';
import HomeSectionHeader from './HomeSectionHeader';

const titleConfig = [
  { type: 'championship', name: 'Чемпионат', image: '/images/cup3.png' },
  { type: 'cup', name: 'Кубок', image: '/images/cup2.png' },
  { type: 'supercup', name: 'Суперкубок', image: '/images/cup1.png' },
];

export default async function TitlesSection() {
  const titles = await withDb(
    () => prisma.title.findMany({ orderBy: { year: 'desc' } }),
    [],
    'titles',
  );

  const titleData = titleConfig.map((config) => {
    const items = titles.filter((t) => t.type === config.type);
    const years = items.map((t) => t.year).sort((a, b) => b - a);
    return { ...config, count: items.length, years: years.join(', ') };
  });

  return (
    <section className="titles" aria-labelledby="home-titles-title">
      <div className="titles__bg" aria-hidden>
        <img src="/images/titles_bg.jpg" alt="" />
        <div className="titles__bg-overlay" />
      </div>

      <div className="home-section-inner">
        <HomeSectionHeader
          title="Титулы"
          linkHref="/club/history"
          linkLabel="История"
          titleId="home-titles-title"
        />

        <div className="titles__content">
          <div className="titles__grid">
            {titleData.map((title) => (
              <TitlesCard key={title.type} title={title} />
            ))}
          </div>
          <div className="titles__stripe" aria-hidden />
        </div>
      </div>

      <div className="titles__decor-title" aria-hidden>
        <span>ТИТУЛЫ</span>
      </div>
    </section>
  );
}
