// src/modules/shared/ui/CompactPageHero.tsx — компактный hero (каталог, таблица и др.)
interface CompactPageHeroProps {
  subtitle: string;
  title: string;
  watermark?: string;
}

export default function CompactPageHero({ subtitle, title, watermark }: CompactPageHeroProps) {
  return (
    <section
      className="compact-page-hero"
      style={{
        position: 'relative',
        zIndex: 0,
        overflow: 'hidden',
        padding: '56px 32px 24px',
        maxWidth: 1400,
        margin: '0 auto',
      }}
    >
      {watermark && (
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
          {watermark}
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
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
          {subtitle}
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
          }}
        >
          {title}
        </h1>
      </div>
    </section>
  );
}
