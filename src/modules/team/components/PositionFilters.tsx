// src/modules/team/components/PositionFilters.tsx
interface FilterItem {
  key: string;
  label: string;
}

interface PlayerData {
  position: string | null;
}

export default function PositionFilters({
  filters,
  current,
  total,
  players,
  onChange,
}: {
  filters: FilterItem[];
  current: string;
  total: number;
  players: PlayerData[];
  onChange: (key: string) => void;
}) {
  return (
    <div
      className="players-grid__filters"
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
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          height: 52,
          overflowX: 'auto',
        }}
      >
        {filters.map(({ key, label }) => {
          const active = current === key;
          const count = key === 'ALL' ? total : players.filter((p) => p.position === key).length;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
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
                color: active ? 'var(--color-accent)' : 'rgba(255,255,255,0.45)',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  const t = e.currentTarget as HTMLButtonElement;
                  t.style.borderColor = 'var(--color-accent-30)';
                  t.style.color = 'rgba(255,255,255,0.75)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  const t = e.currentTarget as HTMLButtonElement;
                  t.style.borderColor = 'var(--color-border)';
                  t.style.color = 'rgba(255,255,255,0.45)';
                }
              }}
            >
              {label}
              <span
                style={{
                  background: active ? 'var(--color-accent-20)' : 'rgba(255,255,255,0.07)',
                  borderRadius: 4,
                  padding: '1px 6px',
                  fontSize: 9,
                  color: active ? 'var(--color-accent)' : 'rgba(255,255,255,0.3)',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
