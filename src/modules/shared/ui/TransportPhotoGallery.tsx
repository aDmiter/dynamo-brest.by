'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faTimes } from '@fortawesome/free-solid-svg-icons';

interface Props {
  images: { src: string; alt: string }[];
}

export default function TransportPhotoGallery({ images }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => setOpenIndex(null), []);

  const goPrev = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }, [images.length]);

  const goNext = useCallback(() => {
    setOpenIndex((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);

  useEffect(() => {
    if (openIndex === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [openIndex, close, goPrev, goNext]);

  const modal =
    openIndex !== null ? (
      <div
        className="transport-services__lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="Просмотр фотографии"
        onClick={close}
      >
        <button
          type="button"
          className="transport-services__lightbox-close"
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
          aria-label="Закрыть"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        <button
          type="button"
          className="transport-services__lightbox-nav transport-services__lightbox-nav--prev"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          aria-label="Предыдущее фото"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <img
          src={images[openIndex].src}
          alt={images[openIndex].alt}
          className="transport-services__lightbox-image"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          type="button"
          className="transport-services__lightbox-nav transport-services__lightbox-nav--next"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          aria-label="Следующее фото"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
        <span className="transport-services__lightbox-counter">
          {openIndex + 1} / {images.length}
        </span>
      </div>
    ) : null;

  return (
    <>
      <div className="transport-services__gallery">
        {images.map((img, index) => (
          <button
            key={`${img.src}-${index}`}
            type="button"
            className="transport-services__gallery-item"
            onClick={() => setOpenIndex(index)}
            aria-label={`Увеличить: ${img.alt}`}
          >
            <img src={img.src} alt={img.alt} loading="lazy" draggable={false} />
          </button>
        ))}
      </div>

      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
