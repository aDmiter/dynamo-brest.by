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
            style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}
          />
        </div>

        <div
          className="titles__info w-full px-4 py-4 transition-all duration-500"
          style={{
            borderRadius: 12,
            border: '1px solid var(--color-border)',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.borderColor = 'var(--color-accent-30)';
            el.style.background = 'var(--color-accent-7)';
            el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.5)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.borderColor = 'var(--color-border)';
            el.style.background = 'rgba(255,255,255,0.04)';
            el.style.boxShadow = 'none';
          }}
        >
          <h3
            className="titles__name text-base font-bold text-white md:text-lg"
            style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
          >
            {title.name}
          </h3>
          <div className="titles__count mt-1 flex justify-center">
            <span
              className="text-4xl font-black md:text-5xl"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontWeight: 900,
                color: 'var(--color-accent)',
              }}
            >
              {title.count}
            </span>
          </div>
          <p className="titles__years mt-2 text-xs" style={{ color: 'var(--color-text-stat)' }}>
            {title.years}
          </p>
        </div>
      </div>
    </div>
  );
}
