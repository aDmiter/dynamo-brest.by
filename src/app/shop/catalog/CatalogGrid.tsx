// src/app/shop/catalog/CatalogGrid.tsx
'use client';

import CatalogProductCard, { type CatalogProductCardData } from '@/modules/shop/components/CatalogProductCard';

interface Category {
  id: string;
  name: string;
}

interface Props {
  products: CatalogProductCardData[];
  filter: string;
  categories: Category[];
}

export default function CatalogGrid({ products, filter, categories }: Props) {
  const filterLabel =
    filter === 'ALL' ? 'ВСЕ ТОВАРЫ' : categories.find((c) => c.id === filter)?.name || '';

  return (
    <div className="shop-catalog__content">
      <header className="shop-catalog__section-header">
        <div className="shop-catalog__section-watermark" aria-hidden>
          {filterLabel}
        </div>
        <div className="shop-catalog__section-header-row">
          <div className="shop-catalog__section-accent" aria-hidden />
          <h2 className="shop-catalog__section-title">
            {filter === 'ALL' ? 'Все товары' : filterLabel}
          </h2>
          <span className="shop-catalog__section-count">{products.length}</span>
          <div className="shop-catalog__section-line" aria-hidden />
        </div>
      </header>

      {products.length === 0 ? (
        <p className="shop-catalog__empty">Товары не найдены</p>
      ) : (
        <div className="shop-catalog__grid">
          {products.map((product, i) => (
            <CatalogProductCard key={product.id} product={product} animationIndex={i} />
          ))}
        </div>
      )}
    </div>
  );
}
