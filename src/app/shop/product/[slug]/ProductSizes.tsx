// src/app/shop/product/[slug]/ProductSizes.tsx
'use client';

import { useState } from 'react';

interface Size {
  size: string;
  quantity: number;
}

interface ProductSizesProps {
  sizes: Size[];
  onSelect?: (size: string) => void;
}

export default function ProductSizes({ sizes, onSelect }: ProductSizesProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (size: string) => {
    setSelected(size);
    if (onSelect) onSelect(size);
  };

  return (
    <div className="mt-8">
      <h3
        className="mb-3 text-right text-xs font-bold uppercase tracking-wider"
        style={{ color: 'var(--color-text-label)' }}
      >
        Размер {selected && <span style={{ color: 'var(--color-accent)' }}>— {selected}</span>}
      </h3>
      <div className="flex flex-wrap justify-end gap-2">
        {sizes.map((ps) => {
          const active = selected === ps.size;
          return (
            <button
              key={ps.size}
              disabled={ps.quantity === 0}
              onClick={() => handleSelect(ps.size)}
              title={ps.quantity === 0 ? 'Нет в наличии' : `В наличии: ${ps.quantity} шт.`}
              style={{
                minWidth: 48,
                height: 40,
                background: active ? 'var(--color-accent-10)' : 'rgba(255,255,255,0.04)',
                border: active
                  ? '1.5px solid var(--color-accent)'
                  : '1.5px solid var(--color-border)',
                borderRadius: 8,
                padding: '0 12px',
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: active
                  ? 'var(--color-accent)'
                  : ps.quantity === 0
                    ? 'rgba(255,255,255,0.2)'
                    : 'rgba(255,255,255,0.55)',
                cursor: ps.quantity === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.18s',
                textDecoration: ps.quantity === 0 ? 'line-through' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!active && ps.quantity > 0) {
                  const t = e.currentTarget as HTMLButtonElement;
                  t.style.borderColor = 'var(--color-accent-30)';
                  t.style.color = 'rgba(255,255,255,0.85)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active && ps.quantity > 0) {
                  const t = e.currentTarget as HTMLButtonElement;
                  t.style.borderColor = 'var(--color-border)';
                  t.style.color = 'rgba(255,255,255,0.55)';
                }
              }}
            >
              {ps.size}
            </button>
          );
        })}
      </div>
    </div>
  );
}
