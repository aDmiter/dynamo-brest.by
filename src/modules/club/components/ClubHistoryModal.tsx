'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { ClubHistoryYear } from '@/config/club-history';
import ClubHistoryBlocks from './ClubHistoryBlocks';

type Props = {
  entry: ClubHistoryYear | null;
  onClose: () => void;
};

export default function ClubHistoryModal({ entry, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!entry) return;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [entry, handleKeyDown]);

  if (!entry) return null;

  return (
    <div
      className="club-history-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="club-history-modal-title"
    >
      <button
        type="button"
        className="club-history-modal__backdrop"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="club-history-modal__panel club-history-glass"
        tabIndex={-1}
      >
        <header className="club-history-modal__header">
          <div>
            <p className="club-history-modal__eyebrow">Сезон</p>
            <h2 id="club-history-modal-title" className="club-history-modal__title">
              {entry.label}
            </h2>
          </div>
          <button
            type="button"
            className="club-history-modal__close"
            onClick={onClose}
            aria-label="Закрыть окно"
          >
            <span aria-hidden>×</span>
          </button>
        </header>
        <div className="club-history-modal__body club-history-content">
          <ClubHistoryBlocks blocks={entry.blocks} idPrefix={`year-${entry.year}`} />
        </div>
      </div>
    </div>
  );
}
