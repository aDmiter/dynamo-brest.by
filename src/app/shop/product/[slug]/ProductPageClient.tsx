// src/app/shop/product/[slug]/ProductPageClient.tsx
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
  useSizes?: boolean;
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
  const hasCustomization = product.hasCustomization === true;
  const useSizes = product.useSizes === true;
  const basePrice = Number(product.price);
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : null;
  const hasAvailable = useSizes ? productSizes.some((s) => s.quantity > 0) : product.quantity > 0;
  const maxQuantity = useSizes
    ? selectedSize
      ? productSizes.find((s) => s.size === selectedSize)?.quantity || 0
      : 0
    : product.quantity;

  return (
    <div
      className="product-page flex min-h-screen"
      style={{ background: 'var(--color-bg-main)', fontFamily: "'Inter Tight', sans-serif" }}
    >
      {/* LEFT: INFO */}
      <div className="product-page__info flex w-full flex-col justify-center px-8 py-16 md:w-1/2 md:pl-20 md:pr-12">
        {/* Category */}
        <p
          className="text-sm uppercase tracking-wider text-right"
          style={{ color: 'var(--color-text-stat)' }}
        >
          {product.productcategory?.name || 'Товар'}
        </p>

        {/* Name */}
        <h1
          className="mt-3 text-right text-4xl font-bold md:text-5xl lg:text-6xl text-white"
          style={{
            fontFamily: "'Inter Tight', sans-serif",
            fontWeight: 900,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
          }}
        >
          {product.name}
        </h1>

        {/* Orange divider */}
        <div
          className="mt-6 mb-6 ml-auto"
          style={{
            height: 1,
            width: 48,
            background: 'linear-gradient(to right, var(--color-accent-30), transparent)',
          }}
        />

        {/* Price */}
        <div className="flex items-baseline justify-end gap-3">
          <div
            style={{
              background: 'var(--color-accent-7)',
              border: '1px solid var(--color-accent-30)',
              borderRadius: 10,
              padding: '8px 18px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(ellipse at top left, var(--color-accent-12) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <span
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 28,
                fontWeight: 900,
                color: 'var(--color-accent)',
                letterSpacing: '-0.04em',
                lineHeight: 1,
                position: 'relative',
              }}
            >
              {basePrice.toFixed(2)} BYN
            </span>
          </div>
          {oldPrice && Number(oldPrice) > basePrice && (
            <span className="text-lg line-through" style={{ color: 'var(--color-text-stat)' }}>
              {Number(oldPrice).toFixed(2)} BYN
            </span>
          )}
        </div>

        {/* Блок с кастомизацией или без */}
        {hasCustomization && customizations.length > 0 ? (
          <ProductPrice basePrice={basePrice} oldPrice={oldPrice}>
            <ProductCustomization
              customizations={customizations}
              players={players}
              basePrice={basePrice}
            />
            {useSizes && productSizes.length > 0 && (
              <ProductSizes sizes={productSizes} onSelect={setSelectedSize} />
            )}

            {/* Stock & Article */}
            <div className="mt-6 flex items-center justify-end gap-3 text-sm">
              {product.inStock && hasAvailable ? (
                <span className="flex items-center gap-1.5" style={{ color: 'var(--color-win)' }}>
                  <FontAwesomeIcon icon={faCheck} className="text-xs" /> В наличии
                </span>
              ) : (
                <span className="flex items-center gap-1.5" style={{ color: 'var(--color-loss)' }}>
                  <FontAwesomeIcon icon={faTimes} className="text-xs" /> Нет в наличии
                </span>
              )}
              {product.article && (
                <span style={{ color: 'var(--color-text-label)' }}>• Арт: {product.article}</span>
              )}
            </div>

            {/* Validation */}
            {useSizes && !selectedSize && (
              <p className="mt-3 text-right text-xs" style={{ color: 'var(--color-accent)' }}>
                Выберите размер
              </p>
            )}
            {useSizes && maxQuantity === 0 && selectedSize && (
              <p className="mt-3 text-right text-xs" style={{ color: 'var(--color-loss)' }}>
                Товар закончился
              </p>
            )}
            {!useSizes && product.quantity === 0 && (
              <p className="mt-3 text-right text-xs" style={{ color: 'var(--color-loss)' }}>
                Товар закончился
              </p>
            )}

            {/* Add to Cart */}
            {(useSizes ? selectedSize && maxQuantity > 0 : product.quantity > 0) && (
              <div className="mt-8 flex justify-end">
                <AddToCartButtonWithPrice
                  productId={product.id}
                  productName={product.name}
                  image={images.length > 0 ? images[0] : ''}
                  selectedSize={useSizes ? selectedSize || null : null}
                />
              </div>
            )}
          </ProductPrice>
        ) : (
          <>
            {useSizes && productSizes.length > 0 && (
              <ProductSizes sizes={productSizes} onSelect={setSelectedSize} />
            )}

            {/* Stock & Article */}
            <div className="mt-6 flex items-center justify-end gap-3 text-sm">
              {product.inStock && hasAvailable ? (
                <span className="flex items-center gap-1.5" style={{ color: 'var(--color-win)' }}>
                  <FontAwesomeIcon icon={faCheck} className="text-xs" /> В наличии
                </span>
              ) : (
                <span className="flex items-center gap-1.5" style={{ color: 'var(--color-loss)' }}>
                  <FontAwesomeIcon icon={faTimes} className="text-xs" /> Нет в наличии
                </span>
              )}
              {product.article && (
                <span style={{ color: 'var(--color-text-label)' }}>• Арт: {product.article}</span>
              )}
            </div>

            {/* Validation */}
            {useSizes && !selectedSize && (
              <p className="mt-3 text-right text-xs" style={{ color: 'var(--color-accent)' }}>
                Выберите размер
              </p>
            )}
            {useSizes && maxQuantity === 0 && selectedSize && (
              <p className="mt-3 text-right text-xs" style={{ color: 'var(--color-loss)' }}>
                Товар закончился
              </p>
            )}
            {!useSizes && product.quantity === 0 && (
              <p className="mt-3 text-right text-xs" style={{ color: 'var(--color-loss)' }}>
                Товар закончился
              </p>
            )}

            {/* Add to Cart */}
            {(useSizes ? selectedSize && maxQuantity > 0 : product.quantity > 0) && (
              <div className="mt-8 flex justify-end">
                <AddToCartButton
                  productId={product.id}
                  productName={product.name}
                  price={basePrice}
                  image={images.length > 0 ? images[0] : ''}
                  selectedSize={useSizes ? selectedSize : null}
                />
              </div>
            )}
          </>
        )}

        {/* Description */}
        {product.description && (
          <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div
              className="prose max-w-none text-right leading-relaxed"
              style={{ color: 'var(--color-text-stat)' }}
            >
              {product.description}
            </div>
          </div>
        )}

        {/* Composition */}
        {product.composition && (
          <div className="mt-8 pt-8" style={{ borderTop: '1px solid var(--color-border)' }}>
            <h3
              className="mb-4 text-right text-lg font-bold uppercase tracking-wider text-white"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
            >
              Состав
            </h3>
            <p className="text-right leading-relaxed" style={{ color: 'var(--color-text-stat)' }}>
              {product.composition}
            </p>
          </div>
        )}
      </div>

      {/* RIGHT: GALLERY */}
      <div className="product-page__gallery relative hidden h-screen w-[50vw] md:block">
        {images.length > 0 ? (
          <ProductImages images={images} productName={product.name} />
        ) : (
          <div
            className="flex h-full items-center justify-center"
            style={{ background: 'var(--color-bg-photo-placeholder)' }}
          >
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
