// src/modules/shared/ui/MatchStadiumButton.tsx - Кнопка стадиона
'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faTimes, faLocationDot } from '@fortawesome/free-solid-svg-icons';

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

  if (!stadiumName) return <span className="text-xs text-white/40">—</span>;

  const addressParts = facility
    ? [facility.address, facility.city, facility.region, facility.country].filter(Boolean)
    : [];

  const yandexMapSrc =
    facility?.lat && facility?.lng
      ? `https://yandex.ru/map-widget/v1/?ll=${facility.lng}%2C${facility.lat}&z=15&pt=${facility.lng},${facility.lat},pm2rdl`
      : addressParts.length > 0
        ? `https://yandex.ru/map-widget/v1/?mode=search&text=${encodeURIComponent(addressParts.join(', '))}&z=13`
        : null;

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
                maxWidth: 640,
                padding: 0,
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-admin)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                borderRadius: 16,
                boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => setIsOpen(false)}
                className="stadium-modal__close"
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 12,
                  zIndex: 20,
                  background: 'rgba(0,0,0,0.6)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  borderRadius: 6,
                  padding: '6px 8px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.8)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.6)';
                }}
              >
                <FontAwesomeIcon icon={faTimes} style={{ fontSize: 16 }} />
              </button>

              {loading ? (
                <div
                  className="stadium-modal__loading"
                  style={{
                    textAlign: 'center',
                    padding: '48px 0',
                    color: 'var(--color-text-stat)',
                  }}
                >
                  Загрузка...
                </div>
              ) : facility ? (
                <div>
                  {yandexMapSrc && (
                    <div style={{ width: '100%', height: 340 }}>
                      <iframe
                        src={yandexMapSrc}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allowFullScreen
                        style={{ border: 'none' }}
                      />
                    </div>
                  )}

                  <div style={{ padding: '20px 24px 24px' }}>
                    <div
                      className="stadium-modal__header"
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        className="stadium-modal__icon"
                        style={{
                          width: 40,
                          height: 40,
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
                          style={{ fontSize: 18, color: 'var(--color-accent)' }}
                        />
                      </div>
                      <div>
                        <h3
                          className="stadium-modal__title"
                          style={{
                            fontFamily: "'Inter Tight', sans-serif",
                            fontSize: 18,
                            fontWeight: 900,
                            color: '#fff',
                          }}
                        >
                          {facility.shortName || facility.name}
                        </h3>
                      </div>
                    </div>

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
                            style={{ color: '#ffffff', fontSize: 13 }}
                          >
                            {facility.address}
                          </p>
                          <p
                            className="stadium-modal__address-sub"
                            style={{ color: 'var(--color-text-label)', fontSize: 11, marginTop: 4 }}
                          >
                            {[facility.city, facility.region, facility.country]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className="stadium-modal__empty"
                  style={{
                    textAlign: 'center',
                    padding: '48px 0',
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
