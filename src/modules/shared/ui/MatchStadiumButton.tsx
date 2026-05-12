// src/modules/shared/ui/MatchStadiumButton.tsx - Кнопка стадиона
'use client';

import { useState } from 'react';
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
        className={`flex items-center gap-2 text-xs transition-colors ${facilityId ? 'text-white/40 hover:text-[#ee862c] cursor-pointer' : 'text-white/40 cursor-default'}`}
      >
        <FontAwesomeIcon icon={faMapMarkerAlt} />
        <span>{stadiumName}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md border border-white/10 bg-[#242C41]/95 backdrop-blur-xl p-8 shadow-2xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="text-lg" />
            </button>

            {loading ? (
              <div className="text-center py-8 text-gray-400">Загрузка...</div>
            ) : facility ? (
              <div>
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-12 w-12 flex items-center justify-center bg-[#ee862c]/20 flex-shrink-0">
                    <FontAwesomeIcon icon={faLocationDot} className="text-[#ee862c] text-xl" />
                  </div>
                  <div>
                    <h3
                      className="font-heading text-xl font-bold text-white"
                      style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
                    >
                      {facility.shortName || facility.name}
                    </h3>
                  </div>
                </div>

                <div className="space-y-4">
                  {facility.address && (
                    <div className="flex items-start gap-2">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="text-[#ee862c] mt-0.5 flex-shrink-0"
                      />
                      <div>
                        <p className="text-gray-300 text-sm">{facility.address}</p>
                        <p className="text-gray-500 text-xs mt-1">
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
                    className="inline-flex items-center gap-2 bg-[#ee862c] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-[#f0ac74] transition-colors"
                  >
                    <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" />
                    Открыть в Google Картах
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-3xl mb-3 opacity-50" />
                <p>Информация о стадионе недоступна</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
