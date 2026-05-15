// src/modules/shared/ui/StadiumModal.tsx - Модальное окно с информацией о стадионе
'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faMapMarkerAlt, faLocationDot } from '@fortawesome/free-solid-svg-icons';

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

  const hasCoordinates = facility?.lat && facility?.lng;

  return createPortal(
    <div className="stadium-modal fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="stadium-modal__overlay absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="stadium-modal__content relative z-10 w-full max-w-md border border-white/10 bg-[#242C41]/95 backdrop-blur-xl p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="stadium-modal__close absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <FontAwesomeIcon icon={faTimes} className="text-lg" />
        </button>

        {loading ? (
          <div className="stadium-modal__loading text-center text-gray-400 py-8">Загрузка...</div>
        ) : facility ? (
          <div className="stadium-modal__body">
            <div className="stadium-modal__header flex items-start gap-4 mb-6">
              <div className="stadium-modal__icon h-12 w-12 flex items-center justify-center bg-[#ee862c]/20 flex-shrink-0">
                <FontAwesomeIcon icon={faLocationDot} className="text-[#ee862c] text-xl" />
              </div>
              <div>
                <h3
                  className="stadium-modal__name font-heading text-xl font-bold text-white"
                  style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
                >
                  {facility.shortName || facility.name}
                </h3>
                {facility.type && (
                  <p className="stadium-modal__type text-xs text-gray-500 mt-0.5">
                    {facility.type}
                  </p>
                )}
              </div>
            </div>

            {facility.address && (
              <div className="stadium-modal__address flex items-start gap-2">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="text-[#ee862c] mt-0.5 flex-shrink-0"
                />
                <div>
                  <p className="text-gray-300">{facility.address}</p>
                  <p className="text-gray-500 text-xs">
                    {[facility.city, facility.region, facility.country].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            )}

            {hasCoordinates && (
              <div className="stadium-modal__map mt-6">
                <a
                  href={`https://www.google.com/maps?q=${facility.lat},${facility.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="stadium-modal__map-link inline-flex items-center gap-2 bg-[#ee862c] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#f0ac74] transition-colors"
                >
                  Открыть на карте
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="stadium-modal__empty text-center text-gray-500 py-8">
            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-3xl mb-3 opacity-50" />
            <p>Информация о стадионе недоступна</p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
