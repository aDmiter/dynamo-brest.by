// src/modules/team/components/StatsPanel.tsx - Панель статистики состава
export default function StatsPanel({
  meta,
}: {
  meta: { total: number; withPhotos: number; avgAge: number; nations: number };
}) {
  return (
    <div
      className="players-grid__stats"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2,1fr)',
        gap: 8,
        minWidth: 240,
      }}
    >
      {/* Всего игроков */}
      <div
        className="players-grid__stat-card"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '14px 16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className="players-grid__stat-value"
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 26,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            marginBottom: 4,
          }}
        >
          {meta.total}
        </div>
        <div
          className="players-grid__stat-label"
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 10,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Всего игроков
        </div>
      </div>

      {/* С фото (акцент) */}
      <div
        className="players-grid__stat-card players-grid__stat-card--accent"
        style={{
          background: 'rgba(238,134,44,0.07)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(238,134,44,0.4)',
          borderRadius: 12,
          padding: '14px 16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className="players-grid__stat-glow"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at top left, rgba(238,134,44,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          className="players-grid__stat-value"
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 26,
            fontWeight: 800,
            color: '#ee862c',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            marginBottom: 4,
            position: 'relative',
          }}
        >
          {meta.withPhotos}
        </div>
        <div
          className="players-grid__stat-label"
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 10,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            position: 'relative',
          }}
        >
          С фото
        </div>
      </div>

      {/* Средний возраст */}
      <div
        className="players-grid__stat-card"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '14px 16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className="players-grid__stat-value"
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 26,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            marginBottom: 4,
          }}
        >
          {meta.avgAge}
        </div>
        <div
          className="players-grid__stat-label"
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 10,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Средний возраст
        </div>
      </div>

      {/* Национальностей */}
      <div
        className="players-grid__stat-card"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12,
          padding: '14px 16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          className="players-grid__stat-value"
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 26,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            marginBottom: 4,
          }}
        >
          {meta.nations}
        </div>
        <div
          className="players-grid__stat-label"
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 10,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Национальностей
        </div>
      </div>
    </div>
  );
}
