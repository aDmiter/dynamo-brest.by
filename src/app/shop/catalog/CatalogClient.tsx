// src/app/shop/catalog/CatalogClient.tsx
'use client';

import { useState, useMemo } from 'react';
import { socialLinks } from '@/modules/config/social';
import CatalogHero from './CatalogHero';
import CatalogFilters from './CatalogFilters';
import CatalogGrid from './CatalogGrid';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  oldPrice: string | null;
  images: string | null;
  productcategory?: { id: string; name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

interface Props {
  products: Product[];
  categories: Category[];
}

export default function CatalogClient({ products, categories }: Props) {
  const [filter, setFilter] = useState<string>('ALL');

  const visible = useMemo(() => {
    if (filter === 'ALL') return products;
    return products.filter((p) => p.productcategory?.id === filter);
  }, [products, filter]);

  return (
    <div
      style={{
        fontFamily: "'Inter Tight', sans-serif",
        background: 'var(--color-bg-main)',
        minHeight: '100vh',
        color: '#ffffff',
        overflowX: 'hidden',
      }}
    >
      <CatalogHero />

      <CatalogFilters
        categories={categories}
        current={filter}
        total={products.length}
        visible={visible.length}
        onChange={setFilter}
      />

      <CatalogGrid products={visible} filter={filter} categories={categories} />
    </div>
  );
}
