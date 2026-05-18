'use client';

import Image from 'next/image';

interface MatchClubBadgeProps {
  name: string;
  logoUrl: string | null;
  tablePosition?: number | null;
  size?: number;
  highlight?: boolean;
  align?: 'left' | 'right' | 'center';
}

export default function MatchClubBadge({
  name,
  logoUrl,
  tablePosition,
  size = 48,
  highlight = false,
  align = 'center',
}: MatchClubBadgeProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className={`home-match__club home-match__club--${align}${highlight ? ' home-match__club--highlight' : ''}`}
    >
      {tablePosition != null && (
        <span className="home-match__table-pos" title="Место в турнирной таблице">
          #{tablePosition}
        </span>
      )}
      <div
        className="home-match__club-badge"
        style={{ width: size, height: size, borderRadius: size * 0.22 }}
      >
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt=""
            width={size - 8}
            height={size - 8}
            className="object-contain"
          />
        ) : (
          <span className="home-match__club-initials">{initials}</span>
        )}
      </div>
      <span className="home-match__club-name">{name}</span>
    </div>
  );
}
