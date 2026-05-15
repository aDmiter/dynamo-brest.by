// src/modules/team/components/SectionHeader.tsx
export default function SectionHeader({
  label,
  count,
  watermark,
}: {
  label: string;
  count: number;
  watermark: string;
}) {
  return (
    <div
      className="players-grid__section-header"
      style={{ position: 'relative', marginBottom: 24, overflow: 'hidden' }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: -8,
          transform: 'translateY(-50%)',
          fontFamily: "'Inter Tight', sans-serif",
          fontSize: 'clamp(48px, 8vw, 80px)',
          fontWeight: 900,
          color: '#ee862c',
          opacity: 0.07,
          letterSpacing: '-0.04em',
          textTransform: 'uppercase',
          userSelect: 'none',
          pointerEvents: 'none',
          lineHeight: 1,
        }}
      >
        {watermark}
      </div>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}
      >
        <div
          style={{
            width: 3,
            height: 28,
            background: 'linear-gradient(to bottom, #ee862c, rgba(238,134,44,0.3))',
            borderRadius: 2,
            flexShrink: 0,
          }}
        />
        <div
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 'clamp(20px, 3vw, 26px)',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}
        >
          {label}
        </div>
        <span
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.25)',
            marginLeft: 4,
          }}
        >
          {count}
        </span>
        <div
          style={{
            flex: 1,
            height: 1,
            background: 'linear-gradient(to right, rgba(238,134,44,0.25), transparent)',
            marginLeft: 6,
          }}
        />
      </div>
    </div>
  );
}
