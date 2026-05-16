// src/modules/team/components/CoachesGrid.tsx — Сетка тренерского штаба
'use client';

import { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

interface CoachData {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  position: string | null;
  photoUrl: string | null;
  birthDate: Date | null;
  nationality: string | null;
  type: string;
}

interface Props {
  coaches: CoachData[];
}

const positionOrder: Record<string, number> = {
  'Главный тренер': 1,
  'Старший тренер': 2,
  Тренер: 3,
};

function getPositionSort(position: string | null): number {
  if (!position) return 99;
  if (positionOrder[position] !== undefined) return positionOrder[position];
  if (position.startsWith('Тренер')) return 10;
  return 50;
}

function calculateAge(birthDate: Date | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getAgeLabel(age: number): string {
  const lastDigit = age % 10;
  const lastTwo = age % 100;
  if (lastTwo >= 11 && lastTwo <= 14) return 'лет';
  if (lastDigit === 1) return 'год';
  if (lastDigit >= 2 && lastDigit <= 4) return 'года';
  return 'лет';
}

export default function CoachesGrid({ coaches }: Props) {
  const sortedCoaches = useMemo(
    () =>
      [...coaches].sort((a, b) => {
        const posA = getPositionSort(a.position);
        const posB = getPositionSort(b.position);
        if (posA !== posB) return posA - posB;
        return (a.lastName || '').localeCompare(b.lastName || '');
      }),
    [coaches]
  );

  return (
    <div
      className="coaches"
      style={{
        fontFamily: "'Inter Tight', sans-serif",
        background: 'var(--color-bg-main)',
        minHeight: '100vh',
        color: '#ffffff',
        overflowX: 'hidden',
      }}
    >
      <style>{`
        @keyframes coachesFadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .coaches__card-enter { animation: coachesFadeUp 0.45s ease forwards; }
      `}</style>

      {/* Hero */}
      <section
        className="coaches__hero"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '56px 32px 40px',
          maxWidth: 1400,
          margin: '0 auto',
        }}
      >
        <div
          className="coaches__watermark"
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
          ШТАБ
        </div>
        <div
          className="coaches__hero-content"
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
              className="coaches__subtitle"
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
              КОМАНДА
            </div>
            <div
              className="coaches__title"
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
              Тренерский штаб
            </div>
          </div>
          <div className="coaches__meta" style={{ display: 'flex', gap: 20 }}>
            <div className="coaches__meta-item" style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: "'Inter Tight', sans-serif",
                  fontSize: 20,
                  fontWeight: 900,
                  color: 'var(--color-accent)',
                }}
              >
                {coaches.length}
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
                Тренеров
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div
        className="coaches__content"
        style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 32px 80px' }}
      >
        <div
          className="coaches__header"
          style={{ position: 'relative', marginBottom: 28, overflow: 'hidden' }}
        >
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
            ШТАБ
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
              Тренерский штаб
            </span>
            <span
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.2)',
              }}
            >
              {coaches.length}
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

        {sortedCoaches.length === 0 ? (
          <div
            className="coaches__empty"
            style={{
              textAlign: 'center',
              padding: '100px 0',
              fontFamily: "'Inter Tight', sans-serif",
              color: 'rgba(255,255,255,0.25)',
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            Информация о тренерском штабе скоро появится
          </div>
        ) : (
          <div
            className="coaches__cards"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: 16,
            }}
          >
            {sortedCoaches.map((coach, i) => (
              <div
                key={coach.id}
                className="coaches__card-enter"
                style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
              >
                <CoachCard coach={coach} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CoachCard({ coach }: { coach: CoachData }) {
  const age = calculateAge(coach.birthDate);

  return (
    <div
      className="coach-card"
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg-card)',
        transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(-6px) scale(1.01)';
        el.style.borderColor = 'var(--color-accent-30)';
        el.style.boxShadow = '0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px var(--color-accent-20)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = 'translateY(0) scale(1)';
        el.style.borderColor = 'var(--color-border)';
        el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.35)';
      }}
    >
      {/* Photo */}
      <div
        className="coach-card__photo"
        style={{ position: 'relative', paddingBottom: '125%', overflow: 'hidden' }}
      >
        {coach.photoUrl ? (
          <img
            src={coach.photoUrl}
            alt={`${coach.lastName} ${coach.firstName}`}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top center',
              transition: 'transform 0.4s ease',
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
        {/* Position badge */}
        {coach.position && (
          <div
            className="coach-card__pos-badge"
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 5,
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
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          >
            {coach.position}
          </div>
        )}
      </div>

      {/* Info */}
      <div
        className="coach-card__info"
        style={{ padding: '0 14px 14px', background: 'var(--color-bg-main)', marginTop: -2 }}
      >
        <div
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 10,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 1,
            paddingTop: 12,
          }}
        >
          {coach.firstName}
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
            marginBottom: 8,
          }}
        >
          {coach.lastName}
        </div>
        <div
          style={{
            height: 1,
            width: 36,
            background: 'linear-gradient(to right, var(--color-accent-30), transparent)',
            marginBottom: 8,
          }}
        />

        <div
          className="coach-card__meta"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          {coach.nationality && (
            <span
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 11,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.45)',
                letterSpacing: '0.02em',
              }}
            >
              {coach.nationality}
            </span>
          )}
          {age && (
            <div
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--color-border-light)',
                borderRadius: 5,
                padding: '2px 8px',
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 10,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.55)',
                letterSpacing: '0.06em',
              }}
            >
              {age} {getAgeLabel(age)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
