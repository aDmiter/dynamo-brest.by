// src/app/shop/product/[slug]/ProductSizes.tsx - Выбор размера
'use client';

import { useState } from 'react';

interface Size {
  size: string;
  quantity: number;
}

interface ProductSizesProps {
  sizes: Size[];
  onSelect?: (size: string) => void;
}

export default function ProductSizes({ sizes, onSelect }: ProductSizesProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (size: string) => {
    setSelected(size);
    if (onSelect) onSelect(size);
  };

  return (
    <div className="mt-8">
      <h3 className="mb-3 text-right text-sm font-bold uppercase tracking-wider text-[#242C41]">
        Размер
      </h3>
      <div className="flex flex-wrap justify-end gap-2">
        {sizes.map((ps) => (
          <button
            key={ps.size}
            disabled={ps.quantity === 0}
            onClick={() => handleSelect(ps.size)}
            title={ps.quantity === 0 ? 'Нет в наличии' : `В наличии: ${ps.quantity} шт.`}
            className={`border px-6 py-3 text-sm font-medium transition-colors ${
              ps.quantity === 0
                ? 'border-gray-200 text-gray-300 cursor-not-allowed line-through'
                : selected === ps.size
                  ? 'border-[#242C41] bg-[#242C41] text-white'
                  : 'border-gray-300 text-[#242C41] hover:border-[#242C41]'
            }`}
          >
            {ps.size}
          </button>
        ))}
      </div>
    </div>
  );
}
