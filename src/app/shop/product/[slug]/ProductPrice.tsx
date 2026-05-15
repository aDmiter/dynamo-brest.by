// src/app/shop/product/[slug]/ProductPrice.tsx
'use client';

import { useState, createContext, useContext } from 'react';

interface ProductPriceContextType {
  basePrice: number;
  extraPrice: number;
  totalPrice: number;
  setExtraPrice: (price: number) => void;
}

const ProductPriceContext = createContext<ProductPriceContextType>({
  basePrice: 0,
  extraPrice: 0,
  totalPrice: 0,
  setExtraPrice: () => {},
});

export function useProductPrice() {
  return useContext(ProductPriceContext);
}

export default function ProductPrice({
  basePrice,
  oldPrice,
  children,
}: {
  basePrice: number;
  oldPrice?: number | null;
  children?: React.ReactNode;
}) {
  const [extraPrice, setExtraPrice] = useState(0);
  const totalPrice = basePrice + extraPrice;

  return (
    <ProductPriceContext.Provider value={{ basePrice, extraPrice, totalPrice, setExtraPrice }}>
      {/* Цена теперь в ProductPageClient, здесь только контекст */}
      {children}
    </ProductPriceContext.Provider>
  );
}
