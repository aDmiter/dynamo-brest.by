// src/app/shop/product/[slug]/ProductPageClient.tsx - Клиентская обёртка
'use client';

import { useState } from 'react';
import ProductImages from './ProductImages';
import AddToCartButton from '@/modules/shop/components/AddToCartButton';
import AddToCartButtonWithPrice from './AddToCartButtonWithPrice';
import ProductCustomization from './ProductCustomization';
import ProductPrice from './ProductPrice';
import ProductSizes from './ProductSizes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

interface Product {
  id: string;
  name: string;
  description: string;
  composition: string | null;
  price: { toString: () => string };
  oldPrice: { toString: () => string } | null;
  article: string | null;
  inStock: boolean;
  images: string | null;
  quantity: number;
  hasCustomization?: boolean;
  productcategory?: { name: string } | null;
  productsize: { size: string; quantity: number }[];
}

interface Customization {
  id: string;
  name: string;
  type: string;
  price: string;
  imageUrl?: string | null;
}

interface Player {
  id: string;
  name: string;
  number: number;
}

interface Props {
  product: Product;
  customizations: Customization[];
  players: Player[];
}

export default function ProductPageClient({ product, customizations, players }: Props) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const images: string[] = product.images ? JSON.parse(product.images) : [];
  const productSizes = product.productsize || [];
  const hasAvailableSizes =
    productSizes.length > 0 ? productSizes.some((s) => s.quantity > 0) : product.quantity > 0;
  const hasCustomization = product.hasCustomization === true;
  const basePrice = Number(product.price);
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : null;

  // Максимальное доступное количество
  const maxQuantity = selectedSize
    ? productSizes.find((s) => s.size === selectedSize)?.quantity || 0
    : product.quantity;

  return (
    <div className="product-page flex min-h-screen bg-white">
      <div className="product-page__info flex w-full flex-col justify-center px-8 py-16 md:w-1/2 md:ml-20 md:pl-12 md:pr-16">
        <p className="text-sm text-gray-400 uppercase tracking-wider text-right">
          {product.productcategory?.name || 'Товар'}
        </p>
        <h1
          className="mt-3 text-right text-4xl font-bold text-[#242C41] md:text-5xl lg:text-6xl"
          style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
        >
          {product.name}
        </h1>

        {hasCustomization && customizations.length > 0 ? (
          <ProductPrice basePrice={basePrice} oldPrice={oldPrice}>
            <ProductCustomization
              customizations={customizations}
              players={players}
              basePrice={basePrice}
            />
            {productSizes.length > 0 && (
              <ProductSizes sizes={productSizes} onSelect={setSelectedSize} />
            )}
            {(selectedSize || productSizes.length === 0) && maxQuantity > 0 && (
              <AddToCartButtonWithPrice
                productId={product.id}
                productName={product.name}
                image={images.length > 0 ? images[0] : ''}
                selectedSize={selectedSize || null}
              />
            )}
            {productSizes.length > 0 && !selectedSize && (
              <p className="mt-4 text-right text-xs text-red-500">Выберите размер</p>
            )}
            {maxQuantity === 0 && selectedSize && (
              <p className="mt-4 text-right text-xs text-red-500">Товар закончился</p>
            )}
          </ProductPrice>
        ) : (
          <>
            <div className="mt-8 flex items-baseline justify-end gap-3">
              <span className="text-4xl font-bold text-[#242C41]">
                {basePrice.toFixed(2)} <span className="text-lg">BYN</span>
              </span>
              {oldPrice && Number(oldPrice) > basePrice && (
                <span className="text-2xl text-gray-400 line-through">
                  {oldPrice.toFixed(2)} BYN
                </span>
              )}
            </div>
            {productSizes.length > 0 && (
              <ProductSizes sizes={productSizes} onSelect={setSelectedSize} />
            )}
            {(selectedSize || productSizes.length === 0) && maxQuantity > 0 && (
              <div className="mt-8 flex justify-end">
                <AddToCartButton
                  productId={product.id}
                  productName={product.name}
                  price={basePrice}
                  image={images.length > 0 ? images[0] : ''}
                  selectedSize={productSizes.length > 0 ? selectedSize : null}
                />
              </div>
            )}
            {productSizes.length > 0 && !selectedSize && (
              <p className="mt-4 text-right text-xs text-red-500">Выберите размер</p>
            )}
            {maxQuantity === 0 && (
              <p className="mt-4 text-right text-xs text-red-500">Товар закончился</p>
            )}
          </>
        )}

        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          {product.inStock && hasAvailableSizes ? (
            <span className="flex items-center gap-1 text-green-600">
              <FontAwesomeIcon icon={faCheck} className="text-xs" /> В наличии
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-500">
              <FontAwesomeIcon icon={faTimes} className="text-xs" /> Нет в наличии
            </span>
          )}
          {product.article && <span className="text-gray-400">• Арт: {product.article}</span>}
        </div>

        {product.description && (
          <div className="mt-12 border-t border-gray-200 pt-8">
            <h3
              className="mb-4 text-right text-lg font-bold uppercase tracking-wider text-[#242C41]"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
            >
              Описание
            </h3>
            <div className="prose max-w-none text-right text-gray-600 leading-relaxed">
              {product.description}
            </div>
          </div>
        )}
        {product.composition && (
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h3
              className="mb-4 text-right text-lg font-bold uppercase tracking-wider text-[#242C41]"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
            >
              Состав
            </h3>
            <p className="text-right text-gray-600 leading-relaxed">{product.composition}</p>
          </div>
        )}
      </div>

      <div className="product-page__gallery relative hidden h-screen w-[50vw] md:block">
        {images.length > 0 ? (
          <ProductImages images={images} productName={product.name} />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100">
            <img
              src="/images/placeholder.jpg"
              alt={product.name}
              className="max-h-full max-w-full object-contain opacity-50"
            />
          </div>
        )}
      </div>
    </div>
  );
}
