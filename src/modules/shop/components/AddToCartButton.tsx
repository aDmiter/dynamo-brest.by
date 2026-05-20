'use client';

import { useState } from 'react';
import ProductCartActions from '@/modules/shop/components/ProductCartActions';

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
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const addLabel = `В корзину${price ? ` — ${price.toFixed(2)} BYN` : ''}`;

  return (
    <ProductCartActions added={added} addLabel={addLabel} onAdd={handleAddToCart} />
  );
}
