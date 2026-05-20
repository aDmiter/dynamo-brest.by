'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCheck, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

interface ProductCartActionsProps {
  added: boolean;
  addLabel: string;
  onAdd: () => void;
  addDisabled?: boolean;
}

export default function ProductCartActions({
  added,
  addLabel,
  onAdd,
  addDisabled = false,
}: ProductCartActionsProps) {
  return (
    <div
      className="product-cart-actions"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 12,
      }}
    >
      <button
        type="button"
        onClick={onAdd}
        disabled={addDisabled}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          height: 52,
          padding: '0 28px',
          background: added ? 'var(--color-win)' : 'var(--color-accent)',
          border: 'none',
          borderRadius: 10,
          fontFamily: "'Inter Tight', sans-serif",
          fontSize: 13,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          cursor: addDisabled ? 'not-allowed' : 'pointer',
          opacity: addDisabled ? 0.5 : 1,
          transition: 'all 0.2s ease',
          boxShadow: added
            ? '0 4px 20px rgba(34,197,94,0.35)'
            : '0 4px 20px rgba(238,134,44,0.3)',
        }}
        onMouseEnter={(e) => {
          if (!added && !addDisabled) {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 6px 28px rgba(238,134,44,0.45)';
          }
        }}
        onMouseLeave={(e) => {
          if (!added && !addDisabled) {
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 4px 20px rgba(238,134,44,0.3)';
          }
        }}
      >
        <FontAwesomeIcon
          icon={added ? faCheck : faShoppingCart}
          style={{ width: 15, height: 15 }}
        />
        {added ? 'Добавлено!' : addLabel}
      </button>

      {added && (
        <Link
          href="/shop/cart"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            height: 52,
            padding: '0 28px',
            background: 'transparent',
            border: '2px solid var(--color-accent)',
            borderRadius: 10,
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 13,
            fontWeight: 800,
            color: 'var(--color-accent)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'var(--color-accent)';
            (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
            (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-accent)';
          }}
        >
          Перейти в корзину
          <FontAwesomeIcon icon={faArrowRight} style={{ width: 14, height: 14 }} />
        </Link>
      )}
    </div>
  );
}
