// src/modules/shop/components/AddToCartButton.tsx - Кнопка добавления в корзину
'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';

interface Props {
  productId: string;
  productName: string;
}

export default function AddToCartButton({ productId, productName }: Props) {
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find((item: { productId: string }) => item.productId === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ productId, productName, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <Button
      onClick={handleAddToCart}
      size="lg"
      disabled={added}
      className={`w-full transition-colors ${
        added ? 'bg-green-600 hover:bg-green-700' : 'bg-[#242C41] hover:bg-[#1a1f30]'
      }`}
    >
      <FontAwesomeIcon icon={added ? faCheck : faShoppingCart} className="mr-2" />
      {added ? 'Добавлено!' : 'В корзину'}
    </Button>
  );
}
