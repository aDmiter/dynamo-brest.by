'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PublicClubHistory, PublicClubHistoryYear } from '@/lib/club-history-types';
import { getClubHistoryDecades } from '@/lib/club-history';
import CompactPageHero from '@/modules/shared/ui/CompactPageHero';
import ClubHistoryIntroContent from './ClubHistoryIntroContent';
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
  entry: PublicClubHistoryYear;
  index: number;
  onOpen: (entry: PublicClubHistoryYear) => void;
}) {
  const { ref, visible } = useInView();
  const side = index % 2 === 0 ? 'left' : 'right';

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
        {entry.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.coverUrl}
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

type Props = {
  data: PublicClubHistory;
};

export default function ClubHistoryView({ data }: Props) {
  const decades = useMemo(() => getClubHistoryDecades(data.years), [data.years]);
  const [activeDecade, setActiveDecade] = useState<number | 'all'>('all');
  const [modalEntry, setModalEntry] = useState<PublicClubHistoryYear | null>(null);

  const filteredYears = useMemo(() => {
    if (activeDecade === 'all') return data.years;
    return data.years.filter(
      (y) => y.year >= activeDecade && y.year < activeDecade + 10,
    );
  }, [activeDecade, data.years]);

  const openModal = useCallback((entry: PublicClubHistoryYear) => {
    setModalEntry(entry);
  }, []);

  const closeModal = useCallback(() => setModalEntry(null), []);

  return (
    <article className="legal-page club-history-page">
      <div className="legal-page__header">
        <CompactPageHero subtitle="Клуб" title="История" watermark="Клуб" />
      </div>

      <section className="legal-page__content club-history">
        <div className="club-history__glow club-history__glow--accent" aria-hidden />
        <div className="club-history__glow club-history__glow--primary" aria-hidden />

        <section className="club-history__intro club-history-glass club-history-content">
          <ClubHistoryIntroContent intro={data.intro} />
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
            <TimelineItem
              key={entry.id}
              entry={entry}
              index={index}
              onOpen={openModal}
            />
          ))}
        </ol>
      </section>

        <ClubHistoryModal entry={modalEntry} onClose={closeModal} />
      </section>
    </article>
  );
}
