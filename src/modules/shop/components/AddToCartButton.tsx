// src/modules/shop/components/AddToCartButton.tsx
'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faCheck } from '@fortawesome/free-solid-svg-icons';

interface Props {
  productId: string;
  productName: string;
  price?: number;
  image?: string;
  selectedSize?: string | null;
}

export default function AddToCartButton({
  productId,
  productName,
  price,
  image,
  selectedSize,
}: Props) {
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartKey = selectedSize
      ? `${productId}_${selectedSize}`
      : `${productId}_nosize_${Date.now()}`;

    if (selectedSize) {
      const existing = cart.find((item: { cartKey: string }) => item.cartKey === cartKey);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          cartKey,
          productId,
          productName,
          quantity: 1,
          price: price || 0,
          image: image || '',
          size: selectedSize,
          customization: null,
        });
      }
    } else {
      const existing = cart.find(
        (item: { productId: string; size?: string }) => item.productId === productId && !item.size
      );
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          cartKey,
          productId,
          productName,
          quantity: 1,
          price: price || 0,
          image: image || '',
          size: null,
          customization: null,
        });
      }
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={added}
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
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: added ? '0 4px 20px rgba(34,197,94,0.35)' : '0 4px 20px rgba(238,134,44,0.3)',
      }}
      onMouseEnter={(e) => {
        if (!added)
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            '0 6px 28px rgba(238,134,44,0.45)';
      }}
      onMouseLeave={(e) => {
        if (!added)
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            '0 4px 20px rgba(238,134,44,0.3)';
      }}
    >
      <FontAwesomeIcon icon={added ? faCheck : faShoppingCart} style={{ width: 15, height: 15 }} />
      {added ? 'Добавлено!' : `В корзину${price ? ` — ${price.toFixed(2)} BYN` : ''}`}
    </button>
  );
}
