// src/app/shop/catalog/CatalogGrid.tsx
'use client';

import CatalogProductCard, { type CatalogProductCardData } from '@/modules/shop/components/CatalogProductCard';

interface Category {
  id: string;
  name: string;
}

interface Props {
  products: CatalogProductCardData[];
  filter: string;
  categories: Category[];
}

export default function CatalogGrid({ products, filter, categories }: Props) {
  const filterLabel =
    filter === 'ALL' ? 'ВСЕ ТОВАРЫ' : categories.find((c) => c.id === filter)?.name || '';

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 32px 80px' }}>
      <div style={{ position: 'relative', marginBottom: 28, overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: -8,
            transform: 'translateY(-50%)',
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 'clamp(44px, 7vw, 72px)',
            fontWeight: 900,
            color: 'var(--color-accent)',
            opacity: 0.065,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            userSelect: 'none',
            pointerEvents: 'none',
            lineHeight: 1,
          }}
          aria-hidden
        >
          {filterLabel}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 3,
              height: 26,
              borderRadius: 2,
              flexShrink: 0,
              background: 'linear-gradient(to bottom, var(--color-accent), var(--color-accent-30))',
            }}
            aria-hidden
          />
          <div
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 'clamp(18px, 2.4vw, 24px)',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            {filter === 'ALL' ? 'Все товары' : filterLabel}
          </div>
          <span
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.22)',
              marginLeft: 2,
            }}
          >
            {products.length}
          </span>
          <div
            style={{
              flex: 1,
              height: 1,
              marginLeft: 6,
              background: 'linear-gradient(to right, var(--color-accent-20), transparent)',
            }}
            aria-hidden
          />
        </div>
      </div>

      {products.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '100px 0',
            color: 'rgba(255,255,255,0.22)',
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          Товары не найдены
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: 16,
            paddingBottom: 80,
          }}
        >
          {products.map((product, i) => (
            <CatalogProductCard key={product.id} product={product} animationIndex={i} />
          ))}
        </div>
      )}
    </div>
  );
}
