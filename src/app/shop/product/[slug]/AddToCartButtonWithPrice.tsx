// src/app/shop/product/[slug]/AddToCartButtonWithPrice.tsx
'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faCheck, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useProductPrice } from './ProductPrice';

interface Props {
  productId: string;
  productName: string;
  image?: string;
  selectedSize?: string | null;
}

export default function AddToCartButtonWithPrice({
  productId,
  productName,
  image,
  selectedSize,
}: Props) {
  const [added, setAdded] = useState(false);
  const { totalPrice } = useProductPrice();

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Выберите размер');
      return;
    }

    const customization = (window as Record<string, unknown>).__lastCustomization || null;
    const cartKey = `${productId}_${selectedSize}_${Date.now()}`;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push({
      cartKey,
      productId,
      productName,
      quantity: 1,
      price: totalPrice,
      image: image || '',
      size: selectedSize,
      customization,
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    delete (window as Record<string, unknown>).__lastCustomization;
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="mt-8 flex justify-end">
      <button
        onClick={handleAddToCart}
        disabled={added}
        className={`inline-flex items-center gap-3 px-10 py-4 text-sm font-bold uppercase tracking-wider transition-all ${added ? 'bg-green-600 text-white' : 'bg-[#ee862c] text-white hover:bg-[#f0ac74]'}`}
      >
        <FontAwesomeIcon icon={added ? faCheck : faShoppingCart} className="text-xs" />
        {added ? 'Добавлено!' : 'В корзину'}
        <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
      </button>
    </div>
  );
}
