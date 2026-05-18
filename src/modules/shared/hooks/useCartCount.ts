'use client';

import { useEffect, useState } from 'react';

export function useCartCount() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce(
          (sum: number, item: { quantity: number }) => sum + item.quantity,
          0,
        );
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('storage', updateCartCount);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  return cartCount;
}
