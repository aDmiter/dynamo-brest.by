// src/app/shop/catalog/CatalogFilters.tsx
'use client';

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
  current: string;
  total: number;
  visible: number;
  onChange: (id: string) => void;
}

export default function CatalogFilters({ categories, current, total, visible, onChange }: Props) {
  const allFilters = [{ id: 'ALL', name: 'Все товары' }, ...categories];

  return (
    <div
      id="products"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(13,17,23,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 32px',
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
          {allFilters.map((cat) => {
            const active = current === cat.id;
            const count = cat.id === 'ALL' ? total : visible;
            return (
              <button
                key={cat.id}
                onClick={() => onChange(cat.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  background: active ? 'var(--color-accent-10)' : 'transparent',
                  border: active
                    ? '1.5px solid var(--color-accent)'
                    : '1.5px solid var(--color-border)',
                  borderRadius: 7,
                  padding: '6px 14px',
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: active ? 'var(--color-accent)' : 'rgba(255,255,255,0.42)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    const t = e.currentTarget as HTMLButtonElement;
                    t.style.borderColor = 'var(--color-accent-30)';
                    t.style.color = 'rgba(255,255,255,0.72)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    const t = e.currentTarget as HTMLButtonElement;
                    t.style.borderColor = 'var(--color-border)';
                    t.style.color = 'rgba(255,255,255,0.42)';
                  }
                }}
              >
                {cat.name}
                <span
                  style={{
                    background: active ? 'var(--color-accent-20)' : 'rgba(255,255,255,0.07)',
                    borderRadius: 4,
                    padding: '1px 6px',
                    fontSize: 9,
                    color: active ? 'var(--color-accent)' : 'rgba(255,255,255,0.28)',
                    fontWeight: 800,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <div
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 10,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.28)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {visible} товаров
        </div>
      </div>
    </div>
  );
}
