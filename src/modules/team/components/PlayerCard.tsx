// src/modules/team/components/PlayerCard.tsx
'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

interface PlayerData {
  id: string;
  slug?: string | null;
  cometId: string | null;
  firstName: string;
  lastName: string;
  number: number | null;
  position: string | null;
  photoUrl: string | null;
  birthDate: Date | null;
  nationality: string | null;
  height: number | null;
  weight: number | null;
}

interface PlayerStats {
  appearances: number;
  goals: number;
  cleanSheets?: number;
  goalsConceded?: number;
  assists?: number;
}

interface Props {
  player: PlayerData;
  teamSlug: string;
  stats: PlayerStats | null;
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

export default function PlayerCard({ player, stats }: Props) {
  const age = calculateAge(player.birthDate);
  const isGoalkeeper = player.position === 'Вратарь';

  return (
    <Link
      href={`/team/player/${player.slug || player.id}`}
      className="player-card"
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.07)',
        background: '#111820',
        display: 'block',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = 'translateY(-6px) scale(1.01)';
        el.style.borderColor = 'rgba(238,134,44,0.45)';
        el.style.boxShadow = '0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(238,134,44,0.2)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = 'translateY(0) scale(1)';
        el.style.borderColor = 'rgba(255,255,255,0.07)';
        el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.35)';
      }}
    >
      {/* Photo */}
      <div
        className="player-card__photo"
        style={{ position: 'relative', paddingBottom: '125%', overflow: 'hidden' }}
      >
        {player.photoUrl ? (
          <img
            src={player.photoUrl}
            alt={`${player.lastName} ${player.firstName}`}
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
              background: '#1a1f2e',
            }}
          >
            <FontAwesomeIcon icon={faUser} style={{ fontSize: 60, color: '#4b5563' }} />
          </div>
        )}

        {player.number && (
          <div
            className="player-card__number-bg"
            style={{
              position: 'absolute',
              bottom: -10,
              right: -6,
              fontFamily: "'Inter Tight', sans-serif",
              fontWeight: 900,
              fontSize: 'clamp(72px, 8vw, 108px)',
              lineHeight: 1,
              color: '#ee862c',
              opacity: 0.15,
              letterSpacing: '-0.05em',
              userSelect: 'none',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          >
            {player.number}
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, #0d1117 0%, rgba(13,17,23,0.55) 40%, rgba(13,17,23,0.02) 100%)',
            zIndex: 2,
          }}
        />

        {player.position && (
          <div
            className="player-card__pos-badge"
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              zIndex: 5,
              background: 'rgba(238,134,44,0.1)',
              border: '1.5px solid #ee862c',
              borderRadius: 6,
              padding: '3px 9px',
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 10,
              fontWeight: 700,
              color: '#ee862c',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          >
            {player.position === 'Вратарь'
              ? 'ВРТ'
              : player.position === 'Защитник'
                ? 'ЗАЩ'
                : player.position === 'Полузащитник'
                  ? 'ПЗЩ'
                  : player.position === 'Нападающий'
                    ? 'НАП'
                    : player.position}
          </div>
        )}

        {player.number && (
          <div
            className="player-card__number"
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              zIndex: 5,
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '0.04em',
            }}
          >
            #{player.number}
          </div>
        )}
      </div>

      {/* Info */}
      <div
        className="player-card__info"
        style={{ padding: '0 14px 14px', background: '#0d1117', marginTop: -2 }}
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
          {player.firstName}
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
          {player.lastName}
        </div>

        <div
          style={{
            height: 1,
            width: 36,
            background: 'linear-gradient(to right, rgba(238,134,44,0.7), transparent)',
            marginBottom: 8,
          }}
        />

        <div
          className="player-card__meta"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
          }}
        >
          {player.nationality && (
            <span
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 11,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.45)',
                letterSpacing: '0.02em',
              }}
            >
              {player.nationality}
            </span>
          )}
          {age && (
            <div
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
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

        {/* Stats */}
        <div
          className="player-card__stats"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5 }}
        >
          <StatBox value={stats?.appearances ?? null} label="Матчей" />
          {isGoalkeeper ? (
            <StatBox value={stats?.cleanSheets ?? null} label="Сухих" accent />
          ) : (
            <StatBox value={stats?.goals ?? null} label="Голов" accent />
          )}
          {isGoalkeeper ? (
            <StatBox value={stats?.goalsConceded ?? null} label="Пропущено" />
          ) : (
            <StatBox value={stats?.assists ?? null} label="Пасов" />
          )}
        </div>
      </div>
    </Link>
  );
}

function StatBox({
  value,
  label,
  accent,
}: {
  value: number | null;
  label: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`player-card__stat${accent ? ' player-card__stat--accent' : ''}`}
      style={{
        background: accent ? 'rgba(238,134,44,0.07)' : 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: accent ? '1px solid rgba(238,134,44,0.35)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        padding: '7px 6px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        height: 42,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}
    >
      {accent && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at top left, rgba(238,134,44,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      )}
      {value !== null ? (
        <>
          <div
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 16,
              fontWeight: 800,
              color: accent ? '#ee862c' : '#ffffff',
              letterSpacing: '-0.03em',
              lineHeight: 1,
              position: 'relative',
            }}
          >
            {value}
          </div>
          <div
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 8,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginTop: 2,
              lineHeight: 1.2,
              position: 'relative',
            }}
          >
            {label}
          </div>
        </>
      ) : (
        <div
          style={{
            width: 16,
            height: 16,
            border: '2px solid rgba(238,134,44,0.15)',
            borderTopColor: 'rgba(238,134,44,0.5)',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
