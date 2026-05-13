// src/modules/shop/components/AddToCartButton.tsx
'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faCheck, faArrowRight } from '@fortawesome/free-solid-svg-icons';

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

    // Если выбран размер — проверяем нет ли уже такого же
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
      // Без размеров — всегда добавляем новую позицию (можно объединять по productId)
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
      className={`inline-flex items-center gap-3 px-10 py-4 text-sm font-bold uppercase tracking-wider transition-all ${added ? 'bg-green-600 text-white' : 'bg-[#ee862c] text-white hover:bg-[#f0ac74]'}`}
    >
      <FontAwesomeIcon icon={added ? faCheck : faShoppingCart} className="text-xs" />
      {added ? 'Добавлено!' : 'В корзину'}
      <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
    </button>
  );
}
