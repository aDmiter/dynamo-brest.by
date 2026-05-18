'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CLUB_HISTORY_INTRO_BLOCKS,
  CLUB_HISTORY_YEARS,
  getClubHistoryDecades,
  type ClubHistoryYear,
} from '@/config/club-history';
import ClubHistoryBlocks from './ClubHistoryBlocks';
import ClubHistoryModal from './ClubHistoryModal';

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLLIElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function TimelineItem({
  entry,
  index,
  onOpen,
}: {
  entry: ClubHistoryYear;
  index: number;
  onOpen: (entry: ClubHistoryYear) => void;
}) {
  const { ref, visible } = useInView();
  const side = index % 2 === 0 ? 'left' : 'right';
  const cover = entry.blocks.find((b) => b.type === 'image');

  return (
    <li
      ref={ref}
      className={`club-history-timeline__item club-history-timeline__item--${side} ${
        visible ? 'club-history-timeline__item--visible' : ''
      } ${entry.highlight ? 'club-history-timeline__item--highlight' : ''}`}
    >
      <button
        type="button"
        className="club-history-timeline__card club-history-glass"
        onClick={() => onOpen(entry)}
      >
        <span className="club-history-timeline__year">{entry.year}</span>
        <span className="club-history-timeline__label">{entry.label}</span>
        {cover && cover.type === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.src}
            alt=""
            className="club-history-timeline__thumb"
            loading="lazy"
          />
        ) : null}
        <p className="club-history-timeline__teaser">{entry.teaser}</p>
        <span className="club-history-timeline__cta">Читать сезон</span>
      </button>
    </li>
  );
}

export default function ClubHistoryView() {
  const currentYear = new Date().getFullYear();
  const decades = useMemo(() => getClubHistoryDecades(), []);
  const [activeDecade, setActiveDecade] = useState<number | 'all'>('all');
  const [modalEntry, setModalEntry] = useState<ClubHistoryYear | null>(null);

  const filteredYears = useMemo(() => {
    if (activeDecade === 'all') return CLUB_HISTORY_YEARS;
    return CLUB_HISTORY_YEARS.filter(
      (y) => y.year >= activeDecade && y.year < activeDecade + 10,
    );
  }, [activeDecade]);

  const openModal = useCallback((entry: ClubHistoryYear) => {
    setModalEntry(entry);
  }, []);

  const closeModal = useCallback(() => setModalEntry(null), []);

  return (
    <div className="club-history">
      <div className="club-history__glow club-history__glow--accent" aria-hidden />
      <div className="club-history__glow club-history__glow--primary" aria-hidden />

      <header className="club-history__hero">
        <div className="club-history__hero-inner">
          <p className="club-history__eyebrow">Клуб</p>
          <h1 className="club-history__title">История</h1>
          <p className="club-history__lead">
            От «Спартака»-1960 до чемпионства и еврокубков — путь «Динамо-Брест» по сезонам
          </p>
        </div>
        <div className="club-history__hero-badge" aria-hidden>
          <span className="club-history__hero-badge-year">1960</span>
          <span className="club-history__hero-badge-dash" />
          <span className="club-history__hero-badge-year">{currentYear}</span>
        </div>
      </header>

      <section className="club-history__intro club-history-glass club-history-content">
        <ClubHistoryBlocks blocks={CLUB_HISTORY_INTRO_BLOCKS} idPrefix="intro" />
      </section>

      <section className="club-history__timeline-section">
        <div className="club-history__timeline-head">
          <h2 className="club-history__section-title">Хронология</h2>
          <div className="club-history__filters" role="tablist" aria-label="Фильтр по десятилетиям">
            <button
              type="button"
              role="tab"
              aria-selected={activeDecade === 'all'}
              className={`club-history__filter ${activeDecade === 'all' ? 'club-history__filter--active' : ''}`}
              onClick={() => setActiveDecade('all')}
            >
              Все годы
            </button>
            {decades.map((decade) => (
              <button
                key={decade}
                type="button"
                role="tab"
                aria-selected={activeDecade === decade}
                className={`club-history__filter ${activeDecade === decade ? 'club-history__filter--active' : ''}`}
                onClick={() => setActiveDecade(decade)}
              >
                {decade}‑е
              </button>
            ))}
          </div>
        </div>

        <ol className="club-history-timeline">
          <div className="club-history-timeline__line" aria-hidden />
          {filteredYears.map((entry, index) => (
            <TimelineItem key={`${entry.year}-${entry.label}`} entry={entry} index={index} onOpen={openModal} />
          ))}
        </ol>
      </section>

      <ClubHistoryModal entry={modalEntry} onClose={closeModal} />
    </div>
  );
}
