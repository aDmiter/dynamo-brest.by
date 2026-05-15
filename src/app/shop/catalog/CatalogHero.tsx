// src/app/shop/catalog/CatalogHero.tsx
'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { socialLinks } from '@/modules/config/social';

export default function CatalogHero() {
  return (
    <section
      style={{
        position: 'relative',
        height: '92vh',
        minHeight: 560,
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Left info panel */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 560,
          padding: '0 52px 0 80px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: -30,
            transform: 'translateY(-56%)',
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 'clamp(140px, 22vw, 300px)',
            fontWeight: 900,
            color: 'var(--color-accent)',
            opacity: 0.08,
            lineHeight: 1,
            letterSpacing: '-0.06em',
            userSelect: 'none',
            pointerEvents: 'none',
            textTransform: 'uppercase',
            zIndex: 0,
          }}
        >
          МАГАЗИН
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div
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
            </div>
            <div
              style={{
                height: 1,
                width: 32,
                background: 'linear-gradient(to right, var(--color-accent-30), transparent)',
              }}
            />
          </div>

          <div
            style={{
              fontSize: 13,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginBottom: 3,
            }}
          >
            Официальный
          </div>

          <div
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 'clamp(52px, 7.5vw, 96px)',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 0.88,
              letterSpacing: '-0.04em',
              textTransform: 'uppercase',
            }}
          >
            ДИНАМО-БРЕСТ
            <br />
            <span
              style={{ WebkitTextStroke: '1.5px rgba(255,255,255,0.22)', color: 'transparent' }}
            >
              МАГАЗИН
            </span>
          </div>

          <div
            style={{
              height: 1,
              width: 80,
              marginTop: 24,
              marginBottom: 24,
              background: 'linear-gradient(to right, var(--color-accent-30), transparent)',
            }}
          />

          <button
            onClick={() =>
              document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
            }
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
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
      </div>

      {/* Right photo */}
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 520, zIndex: 1 }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: 320,
            zIndex: 2,
            background:
              'linear-gradient(to right, var(--color-bg-main) 0%, rgba(13,17,23,0.88) 38%, rgba(13,17,23,0.2) 68%, transparent 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 200,
            zIndex: 2,
            background: 'linear-gradient(to top, var(--color-bg-main) 0%, transparent 100%)',
          }}
        />
        <img
          src="/images/shop-hero.jpg"
          alt="Магазин"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            display: 'block',
          }}
        />
      </div>

      {/* Соцсети справа */}
      <div
        style={{
          position: 'absolute',
          right: 24,
          top: '50%',
          zIndex: 20,
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 18,
        }}
      >
        {socialLinks.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            style={{ color: 'rgba(255,255,255,0.45)', transition: 'all 0.2s ease' }}
            onMouseEnter={(e) => {
              const t = e.currentTarget as HTMLAnchorElement;
              t.style.color = 'rgba(255,255,255,0.95)';
              t.style.transform = 'scale(1.15)';
            }}
            onMouseLeave={(e) => {
              const t = e.currentTarget as HTMLAnchorElement;
              t.style.color = 'rgba(255,255,255,0.45)';
              t.style.transform = 'scale(1)';
            }}
          >
            <FontAwesomeIcon icon={social.icon} style={{ width: 16, height: 16 }} />
          </a>
        ))}
        <div
          style={{
            width: 1,
            height: 40,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)',
            marginTop: 4,
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 5,
          pointerEvents: 'none',
          background:
            'linear-gradient(to right, rgba(13,17,23,0.92) 0%, rgba(13,17,23,0.55) 42%, transparent 68%)',
        }}
      />
    </section>
  );
}
