'use client';

import { useState } from 'react';
import ProductCartActions from '@/modules/shop/components/ProductCartActions';
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
    const customization =
      (window as unknown as Record<string, unknown>).__lastCustomization || null;
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
    delete (window as unknown as Record<string, unknown>).__lastCustomization;
    setAdded(true);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <ProductCartActions
      added={added}
      addLabel={`В корзину — ${totalPrice.toFixed(2)} BYN`}
      onAdd={handleAddToCart}
    />
  );
}
