// src/app/shop/product/[slug]/ProductPrice.tsx - Динамическая цена
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
      <div className="mt-8 flex items-baseline justify-end gap-3">
        <span className="text-4xl font-bold text-[#242C41]">
          {totalPrice.toFixed(2)} <span className="text-lg">BYN</span>
        </span>
        {oldPrice && Number(oldPrice) > basePrice && (
          <span className="text-2xl text-gray-400 line-through">
            {Number(oldPrice).toFixed(2)} BYN
          </span>
        )}
        {extraPrice > 0 && (
          <span className="text-sm text-[#ee862c]">
            (включая нанесение +{extraPrice.toFixed(2)} BYN)
          </span>
        )}
      </div>
      {children}
    </ProductPriceContext.Provider>
  );
}
