// src/modules/team/components/AdministrationGrid.tsx
'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  position: string | null;
  photoUrl: string | null;
  nationality: string | null;
}

interface Props {
  members: Member[];
}

export default function AdministrationGrid({ members }: Props) {
  return (
    <div
      style={{
        fontFamily: "'Inter Tight', sans-serif",
        background: 'var(--color-bg-main)',
        minHeight: '100vh',
        color: '#ffffff',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        @keyframes admFadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .adm__card-enter { animation: admFadeUp 0.45s ease forwards; }
      `}</style>

      {/* Hero */}
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '56px 32px 40px',
          maxWidth: 1400,
          margin: '0 auto',
        }}
      >
        <div
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
          КЛУБ
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
            <div
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 13,
                fontWeight: 400,
                color: 'rgba(255,255,255,0.45)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                marginBottom: 2,
              }}
            >
              КЛУБ
            </div>
            <div
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
              Администрация
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: 20,
                  fontWeight: 900,
                  color: 'var(--color-accent)',
                }}
              >
                {members.length}
              </div>
              <div
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: 8,
                  fontWeight: 600,
                  color: 'var(--color-text-label)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginTop: 2,
                }}
              >
                Человек
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 32px 80px' }}>
        <div style={{ position: 'relative', marginBottom: 28, overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: -4,
              transform: 'translateY(-50%)',
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 'clamp(36px, 5.5vw, 60px)',
              fontWeight: 900,
              color: 'var(--color-accent)',
              opacity: 0.065,
              letterSpacing: '-0.04em',
              textTransform: 'uppercase',
              userSelect: 'none',
              pointerEvents: 'none',
              lineHeight: 1,
            }}
          >
            КЛУБ
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: 3,
                height: 22,
                borderRadius: 2,
                flexShrink: 0,
                background:
                  'linear-gradient(to bottom, var(--color-accent), var(--color-accent-30))',
              }}
            />
            <span
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 'clamp(15px, 2vw, 19px)',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-0.03em',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              Администрация клуба
            </span>
            <span
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.2)',
              }}
            >
              {members.length}
            </span>
            <div
              style={{
                flex: 1,
                height: 1,
                marginLeft: 4,
                background: 'linear-gradient(to right, var(--color-accent-20), transparent)',
              }}
            />
          </div>
        </div>

        <div className="administration-grid__cards">
          {members.map((m, i) => (
            <div
              key={m.id}
              className="adm__card-enter"
              style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
            >
              <div
                style={{
                  position: 'relative',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-card)',
                  transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = 'translateY(-6px) scale(1.01)';
                  el.style.borderColor = 'var(--color-accent-30)';
                  el.style.boxShadow =
                    '0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px var(--color-accent-20)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = 'translateY(0) scale(1)';
                  el.style.borderColor = 'var(--color-border)';
                  el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.35)';
                }}
              >
                <div style={{ position: 'relative', paddingBottom: '125%', overflow: 'hidden' }}>
                  {m.photoUrl ? (
                    <img
                      src={m.photoUrl}
                      alt={`${m.lastName} ${m.firstName}`}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'top center',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--color-bg-photo-placeholder)',
                      }}
                    >
                      <FontAwesomeIcon icon={faUser} style={{ fontSize: 60, color: '#4b5563' }} />
                    </div>
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to top, var(--color-bg-main) 0%, rgba(13,17,23,0.55) 40%, rgba(13,17,23,0.02) 100%)',
                      zIndex: 2,
                    }}
                  />
                </div>
                <div
                  style={{
                    padding: '0 14px 14px',
                    background: 'var(--color-bg-main)',
                    marginTop: -2,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: 10,
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.4)',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      paddingTop: 12,
                    }}
                  >
                    {m.firstName}
                    {m.middleName ? ` ${m.middleName}` : ''}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Inter Tight', sans-serif",
                      fontSize: 'clamp(18px, 2.2vw, 22px)',
                      fontWeight: 900,
                      color: '#ffffff',
                      letterSpacing: '-0.03em',
                      lineHeight: 1,
                      textTransform: 'uppercase',
                      marginTop: 4,
                    }}
                  >
                    {m.lastName}
                  </div>
                  {m.position && (
                    <div
                      style={{
                        marginTop: 6,
                        display: 'inline-block',
                        background: 'var(--color-accent-10)',
                        border: '1.5px solid var(--color-accent)',
                        borderRadius: 6,
                        padding: '3px 9px',
                        fontFamily: "'Inter Tight', sans-serif",
                        fontSize: 10,
                        fontWeight: 700,
                        color: 'var(--color-accent)',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {m.position}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
