'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import type { MatchProtocolPayload, ProtocolPlayer } from '@/lib/match-protocol';
import ProtocolPlayerStats from './ProtocolPlayerStats';
import ProtocolSubIndicator from './ProtocolSubIndicator';

interface Props {
  matchId: string;
  open: boolean;
  onClose: () => void;
}

function formatMatchDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function PlayerName({ player }: { player: ProtocolPlayer }) {
  const content = (
    <>
      {player.shirtNumber != null && (
        <span className="match-protocol__player-num">{player.shirtNumber}</span>
      )}
      <span className="match-protocol__player-name-text">
        <span className="match-protocol__player-surname">{player.surname}</span>
        {player.firstName ? (
          <span className="match-protocol__player-firstname">{player.firstName}</span>
        ) : null}
      </span>
    </>
  );

  if (player.slug) {
    return (
      <Link href={`/team/player/${player.slug}`} className="match-protocol__player-link">
        {content}
      </Link>
    );
  }

  return <span className="match-protocol__player-name">{content}</span>;
}

function PlayerRow({ player }: { player: ProtocolPlayer }) {
  const subbedOff = player.substitution === 'out';
  const hasAside =
    subbedOff ||
    player.substitution === 'in' ||
    player.goals > 0 ||
    player.assists > 0 ||
    player.yellowCards > 0 ||
    player.redCards > 0;

  return (
    <li
      className={`match-protocol__player${!player.played ? ' match-protocol__player--bench' : ''}${
        subbedOff ? ' match-protocol__player--subbed-off' : ''
      }${player.isGoalkeeper ? ' match-protocol__player--gk' : ''}`}
    >
      <div className="match-protocol__player-photo">
        {player.photoUrl ? (
          <Image src={player.photoUrl} alt="" width={52} height={52} className="object-cover" />
        ) : (
          <span className="match-protocol__player-placeholder">
            {player.shirtNumber ?? '—'}
          </span>
        )}
      </div>

      <div className="match-protocol__player-row">
        <PlayerName player={player} />
        {hasAside && (
          <div className="match-protocol__player-aside">
            {player.substitution && (
              <ProtocolSubIndicator
                type={player.substitution}
                minute={player.substitutionMinute}
              />
            )}
            <ProtocolPlayerStats
              goals={player.goals}
              assists={player.assists}
              yellowCards={player.yellowCards}
              redCards={player.redCards}
            />
          </div>
        )}
      </div>
    </li>
  );
}

function SquadBlock({
  teamName,
  starters,
  substitutes,
}: {
  teamName: string;
  starters: ProtocolPlayer[];
  substitutes: ProtocolPlayer[];
}) {
  return (
    <div className="match-protocol__squad">
      <h4 className="match-protocol__squad-title">{teamName}</h4>
      {starters.length > 0 ? (
        <>
          <p className="match-protocol__squad-label">Стартовый состав</p>
          <ul className="match-protocol__players">
            {starters.map((p) => (
              <PlayerRow key={p.personCometId} player={p} />
            ))}
          </ul>
        </>
      ) : (
        <p className="match-protocol__empty">Состав не загружен</p>
      )}
      {substitutes.length > 0 && (
        <>
          <p className="match-protocol__squad-label">Запасные</p>
          <ul className="match-protocol__players">
            {substitutes.map((p) => (
              <PlayerRow key={p.personCometId} player={p} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default function MatchProtocolModal({ matchId, open, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [protocol, setProtocol] = useState<MatchProtocolPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !matchId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/matches/${matchId}/protocol`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
          setProtocol(null);
        } else {
          setProtocol(data.protocol);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Не удалось загрузить протокол');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, matchId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const m = protocol?.match;

  return createPortal(
    <div
      className="match-protocol"
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-protocol-title"
    >
      <button
        type="button"
        className="match-protocol__backdrop"
        onClick={onClose}
        aria-label="Закрыть"
      />
      <div className="match-protocol__panel">
        <img
          src="/images/logos/logo-white.png"
          alt=""
          className="match-protocol__bg-logo"
          aria-hidden
        />
        <button
          type="button"
          className="match-protocol__close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className="match-protocol__panel-scroll">
        {loading && <p className="match-protocol__status">Загрузка протокола…</p>}
        {error && <p className="match-protocol__status match-protocol__status--error">{error}</p>}

        {!loading && !error && protocol && m && (
          <>
            <header className="match-protocol__header">
              <div className="match-protocol__header-accent" aria-hidden />
              <p className="match-protocol__meta">
                {[m.tournament, m.round ? `${m.round} тур` : null, formatMatchDate(m.matchDate)]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <h2 id="match-protocol-title" className="match-protocol__scoreline">
                <span>{m.homeTeam}</span>
                <span className="match-protocol__score">
                  {m.homeScore ?? '—'} : {m.awayScore ?? '—'}
                </span>
                <span>{m.awayTeam}</span>
              </h2>
              {m.stadium && <p className="match-protocol__stadium">{m.stadium}</p>}
            </header>

            <SquadBlock
              teamName={protocol.squad.teamName}
              starters={protocol.squad.starters}
              substitutes={protocol.squad.substitutes}
            />

            {protocol.squad.starters.length === 0 &&
              protocol.squad.substitutes.length === 0 && (
              <p className="match-protocol__status">
                Данные протокола ещё не синхронизированы. Запустите синхронизацию в админке.
              </p>
            )}
          </>
        )}
        </div>
      </div>
    </div>,
    document.body
  );
}
