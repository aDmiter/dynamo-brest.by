// src/modules/shared/ui/MatchStadiumButton.tsx - Кнопка стадиона
'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt,
  faTimes,
  faLocationDot,
  faExternalLinkAlt,
} from '@fortawesome/free-solid-svg-icons';

interface Facility {
  id: string;
  cometId: number;
  name: string;
  shortName: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
}

interface Props {
  facilityId: number | null;
  stadiumName: string | null;
}

const facilityCache = new Map<number, Facility | null>();

export default function MatchStadiumButton({ facilityId, stadiumName }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!facilityId) return;
    setIsOpen(true);

    if (facilityCache.has(facilityId)) {
      setFacility(facilityCache.get(facilityId)!);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/facilities/${facilityId}`);
      const data = await res.json();
      const result = data.error ? null : data;
      facilityCache.set(facilityId, result);
      setFacility(result);
    } catch {
      setFacility(null);
    } finally {
      setLoading(false);
    }
  };

  const getMapQuery = (f: Facility): string => {
    const parts = [f.shortName || f.name, f.address, f.city, f.country].filter(Boolean);
    return encodeURIComponent(parts.join(', '));
  };

  const getMapUrl = (f: Facility): string => {
    return `https://www.google.com/maps/search/?api=1&query=${getMapQuery(f)}`;
  };

  if (!stadiumName) return <span className="text-xs text-white/40">—</span>;

  return (
    <>
      <button
        onClick={handleClick}
        className="stadium-button"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          transition: 'color 0.2s ease',
          color: 'rgba(255,255,255,0.4)',
          cursor: facilityId ? 'pointer' : 'default',
          background: 'none',
          border: 'none',
          padding: 0,
        }}
        onMouseEnter={(e) => {
          if (facilityId) {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)';
          }
        }}
        onMouseLeave={(e) => {
          if (facilityId) {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)';
          }
        }}
      >
        <FontAwesomeIcon icon={faMapMarkerAlt} />
        <span>{stadiumName}</span>
      </button>

      {isOpen &&
        createPortal(
          <div
            className="stadium-modal"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
          >
            <div
              className="stadium-modal__backdrop"
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            />
            <div
              className="stadium-modal__content"
              style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: 448,
                padding: 32,
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-admin)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: 16,
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
              }}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="stadium-modal__close"
                style={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-stat)',
                  cursor: 'pointer',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-stat)';
                }}
              >
                <FontAwesomeIcon icon={faTimes} style={{ fontSize: 18 }} />
              </button>

              {loading ? (
                <div
                  className="stadium-modal__loading"
                  style={{
                    textAlign: 'center',
                    padding: '32px 0',
                    color: 'var(--color-text-stat)',
                  }}
                >
                  Загрузка...
                </div>
              ) : facility ? (
                <div>
                  <div
                    className="stadium-modal__header"
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}
                  >
                    <div
                      className="stadium-modal__icon"
                      style={{
                        width: 48,
                        height: 48,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        background: 'var(--color-accent-10)',
                        borderRadius: 8,
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faLocationDot}
                        style={{ fontSize: 20, color: 'var(--color-accent)' }}
                      />
                    </div>
                    <div>
                      <h3
                        className="stadium-modal__title"
                        style={{
                          fontFamily: "'Inter Tight', sans-serif",
                          fontSize: 20,
                          fontWeight: 900,
                          color: '#fff',
                        }}
                      >
                        {facility.shortName || facility.name}
                      </h3>
                    </div>
                  </div>

                  <div
                    className="stadium-modal__info"
                    style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
                  >
                    {facility.address && (
                      <div
                        className="stadium-modal__address"
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}
                      >
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          style={{ marginTop: 2, flexShrink: 0, color: 'var(--color-accent)' }}
                        />
                        <div>
                          <p
                            className="stadium-modal__address-text"
                            style={{ color: '#ffffff', fontSize: 14 }}
                          >
                            {facility.address}
                          </p>
                          <p
                            className="stadium-modal__address-sub"
                            style={{ color: 'var(--color-text-label)', fontSize: 12, marginTop: 4 }}
                          >
                            {[facility.city, facility.region, facility.country]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        </div>
                      </div>
                    )}

                    <a
                      href={getMapUrl(facility)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="stadium-modal__map-link"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'var(--color-accent)',
                        borderRadius: 8,
                        padding: '10px 20px',
                        color: '#fff',
                        fontFamily: "'Inter Tight', sans-serif",
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        textDecoration: 'none',
                        transition: 'background 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background =
                          'var(--color-accent-hover)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.background =
                          'var(--color-accent)';
                      }}
                    >
                      <FontAwesomeIcon icon={faExternalLinkAlt} style={{ fontSize: 10 }} />
                      Открыть в Google Картах
                    </a>
                  </div>
                </div>
              ) : (
                <div
                  className="stadium-modal__empty"
                  style={{
                    textAlign: 'center',
                    padding: '32px 0',
                    color: 'var(--color-text-label)',
                  }}
                >
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}
                  />
                  <p>Информация о стадионе недоступна</p>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
