// src/app/shop/catalog/CatalogHero.tsx
'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function CatalogHero() {
  return (
    <section
      className="catalog-hero"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '56px 32px 40px',
        maxWidth: 1400,
        margin: '0 auto',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: '50%',
          right: -24,
          transform: 'translateY(-50%)',
          fontFamily: "'Inter Tight', sans-serif",
          fontSize: 'clamp(100px, 18vw, 220px)',
          fontWeight: 900,
          color: 'var(--color-accent)',
          opacity: 0.055,
          letterSpacing: '-0.05em',
          textTransform: 'uppercase',
          userSelect: 'none',
          pointerEvents: 'none',
          lineHeight: 1,
        }}
      >
        ФАН-ШОП
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 32,
          flexWrap: 'wrap',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span
              style={{
                background: 'var(--color-accent-10)',
                border: '1.5px solid var(--color-accent)',
                borderRadius: 6,
                padding: '4px 12px',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--color-accent)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              2026 Коллекция
            </span>
            <span
              style={{
                height: 1,
                width: 32,
                background: 'linear-gradient(to right, var(--color-accent-30), transparent)',
              }}
            />
          </div>

          <p
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: 2,
            }}
          >
            Официальный
          </p>

          <h1
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 'clamp(48px, 7vw, 80px)',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            ФАН-ШОП
          </h1>
        </div>

        <button
          type="button"
          onClick={() =>
            document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
          }
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
            background: 'transparent',
            border: '1.5px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: '11px 22px',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            const t = e.currentTarget as HTMLButtonElement;
            t.style.borderColor = 'var(--color-accent)';
            t.style.color = 'var(--color-accent)';
            t.style.background = 'var(--color-accent-7)';
          }}
          onMouseLeave={(e) => {
            const t = e.currentTarget as HTMLButtonElement;
            t.style.borderColor = 'rgba(255,255,255,0.2)';
            t.style.color = 'rgba(255,255,255,0.7)';
            t.style.background = 'transparent';
          }}
        >
          Смотреть товары
          <FontAwesomeIcon icon={faArrowRight} style={{ width: 13, height: 13 }} />
        </button>
      </div>
    </section>
  );
}
