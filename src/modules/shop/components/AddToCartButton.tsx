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
    // Получаем текущую корзину из localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Проверяем, есть ли уже такой товар
    const existing = cart.find((item: { productId: string }) => item.productId === productId);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ productId, productName, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    setAdded(true);

    setTimeout(() => setAdded(false), 2000);

    // Событие обновления корзины
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <Button
      onClick={handleAddToCart}
      size="lg"
      className={`w-full transition-colors ${
        added ? 'bg-green-600 hover:bg-green-700' : 'bg-[#003366] hover:bg-[#002244]'
      }`}
      disabled={added}
    >
      <FontAwesomeIcon icon={added ? faCheck : faShoppingCart} className="mr-2" />
      {added ? 'Добавлено!' : 'В корзину'}
    </Button>
  );
}
