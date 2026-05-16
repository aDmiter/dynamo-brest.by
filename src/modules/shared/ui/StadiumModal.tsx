// src/modules/shared/ui/StadiumModal.tsx - Модальное окно с информацией о стадионе
'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faMapMarkerAlt,
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
  type: string | null;
  lat: number | null;
  lng: number | null;
}

interface StadiumModalProps {
  facilityId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

const facilityCache = new Map<number, Facility | null>();

function getYandexMapsUrl(facility: Facility): string {
  const addressParts = [facility.address, facility.city, facility.region, facility.country].filter(
    Boolean
  );
  const query = encodeURIComponent(addressParts.join(', '));
  if (facility.lat && facility.lng) {
    return `https://yandex.ru/maps/?ll=${facility.lng},${facility.lat}&z=16&pt=${facility.lng},${facility.lat},pm2rdl&text=${query}`;
  }
  return `https://yandex.ru/maps/?mode=search&text=${query}&z=13`;
}

export default function StadiumModal({ facilityId, isOpen, onClose }: StadiumModalProps) {
  const [facility, setFacility] = useState<Facility | null>(() => {
    return facilityId ? (facilityCache.get(facilityId) ?? null) : null;
  });
  const [loading, setLoading] = useState(false);
  const [loadedId, setLoadedId] = useState<number | null>(() => facilityId);

  if (isOpen && facilityId && facilityId !== loadedId) {
    setLoadedId(facilityId);

    if (facilityCache.has(facilityId)) {
      setFacility(facilityCache.get(facilityId)!);
    } else {
      setLoading(true);
      fetch(`/api/facilities/${facilityId}`)
        .then((r) => r.json())
        .then((data) => {
          const result = data.error ? null : data;
          facilityCache.set(facilityId, result);
          setFacility(result);
        })
        .catch(() => {
          facilityCache.set(facilityId, null);
          setFacility(null);
        })
        .finally(() => setLoading(false));
    }
  }

  if (!isOpen) return null;

  return createPortal(
    <div className="stadium-modal fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="stadium-modal__overlay absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        className="stadium-modal__content relative z-10 w-full max-w-md p-8 shadow-2xl"
        style={{
          border: '1px solid var(--color-border)',
          background: 'var(--color-bg-admin)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 16,
        }}
      >
        <button
          onClick={onClose}
          className="stadium-modal__close absolute right-4 top-4 transition-colors"
          style={{ color: 'var(--color-text-stat)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-stat)';
          }}
        >
          <FontAwesomeIcon icon={faTimes} className="text-lg" />
        </button>

        {loading ? (
          <div
            className="stadium-modal__loading text-center py-8"
            style={{ color: 'var(--color-text-stat)' }}
          >
            Загрузка...
          </div>
        ) : facility ? (
          <div className="stadium-modal__body">
            <div className="stadium-modal__header flex items-start gap-4 mb-6">
              <div
                className="stadium-modal__icon h-12 w-12 flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--color-accent-10)', borderRadius: 8 }}
              >
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="text-xl"
                  style={{ color: 'var(--color-accent)' }}
                />
              </div>
              <div>
                <h3
                  className="stadium-modal__name text-xl font-bold text-white"
                  style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
                >
                  {facility.shortName || facility.name}
                </h3>
                {facility.type && (
                  <p
                    className="stadium-modal__type text-xs mt-0.5"
                    style={{ color: 'var(--color-text-label)' }}
                  >
                    {facility.type}
                  </p>
                )}
              </div>
            </div>

            {facility.address && (
              <div className="stadium-modal__address flex items-start gap-2">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="mt-0.5 flex-shrink-0"
                  style={{ color: 'var(--color-accent)' }}
                />
                <div>
                  <p className="text-sm" style={{ color: 'var(--color-text-nav)' }}>
                    {facility.address}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-label)' }}>
                    {[facility.city, facility.region, facility.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            )}

            <div className="stadium-modal__map mt-6">
              <a
                href={getYandexMapsUrl(facility)}
                target="_blank"
                rel="noopener noreferrer"
                className="stadium-modal__map-link inline-flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white transition-colors"
                style={{
                  background: 'var(--color-accent)',
                  borderRadius: 8,
                  textDecoration: 'none',
                  fontFamily: "'Inter Tight', sans-serif",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background =
                    'var(--color-accent-hover)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-accent)';
                }}
              >
                <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
                Открыть в Яндекс.Картах
              </a>
            </div>
          </div>
        ) : (
          <div
            className="stadium-modal__empty text-center py-8"
            style={{ color: 'var(--color-text-label)' }}
          >
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-3xl mb-3 opacity-50" />
            <p>Информация о стадионе недоступна</p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
