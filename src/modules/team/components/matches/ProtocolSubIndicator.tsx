import type { ProtocolSubstitution } from '@/lib/match-protocol';

interface Props {
  type: ProtocolSubstitution;
  minute?: string | null;
}

export default function ProtocolSubIndicator({ type, minute }: Props) {
  const label =
    type === 'in'
      ? `Вышел на поле${minute ? `, ${minute}` : ''}`
      : `Заменён${minute ? `, ${minute}` : ''}`;

  return (
    <span
      className={`match-protocol__sub match-protocol__sub--${type}`}
      title={label}
      aria-label={label}
    >
      <svg
        className="match-protocol__sub-arrow"
        viewBox="0 0 20 20"
        width={18}
        height={18}
        aria-hidden
      >
        {type === 'in' ? (
          <path
            d="M4 14 L10 6 L16 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <>
            <path
              d="M10 3 L10 17"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M5 12 L10 17 L15 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
      </svg>
      {minute ? <span className="match-protocol__sub-minute">{minute}</span> : null}
    </span>
  );
}
