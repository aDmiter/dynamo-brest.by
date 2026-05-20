// src/modules/shared/ui/TitlesCard.tsx
'use client';

interface TitleData {
  type: string;
  name: string;
  image: string;
  count: number;
  years: string;
}

export default function TitlesCard({ title }: { title: TitleData }) {
  return (
    <div className="titles__item group flex flex-col items-center text-center">
      <div className="titles__card flex h-full w-full flex-col items-center">
        <div className="titles__cup relative mb-6 w-32 transition-all duration-700 group-hover:scale-110 group-hover:-translate-y-4 md:w-40">
          <div
            className="titles__glow absolute inset-0 scale-75 rounded-full blur-3xl transition-all duration-1000 group-hover:scale-100"
            style={{ background: 'var(--color-accent-10)' }}
          />
          <img
            src={title.image}
            alt={title.name}
            className="titles__cup-image relative z-10 w-full drop-shadow-2xl transition-all duration-700"
            style={{ filter: 'drop-shadow(0 10px 20px rgba(36, 44, 65, 0.2))' }}
          />
        </div>

        <div className="titles__info">
          <h3 className="titles__name">{title.name}</h3>
          <div className="titles__count mt-1 flex justify-center">
            <span className="titles__count-value">{title.count}</span>
          </div>
          {title.years ? <p className="titles__years">{title.years}</p> : null}
        </div>
      </div>
    </div>
  );
}
