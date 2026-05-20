// src/app/shop/catalog/CatalogClient.tsx
'use client';

import { useState, useMemo } from 'react';
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
  isHit?: boolean;
  productcategory?: { id: string; name: string } | null;
  manufacturer?: { name: string } | null;
}

function sortHitsFirst(list: Product[]): Product[] {
  return [...list].sort((a, b) => Number(b.isHit) - Number(a.isHit));
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

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const product of products) {
      const categoryId = product.productcategory?.id;
      if (!categoryId) continue;
      counts[categoryId] = (counts[categoryId] ?? 0) + 1;
    }
    return counts;
  }, [products]);

  const visible = useMemo(() => {
    const filtered =
      filter === 'ALL' ? products : products.filter((p) => p.productcategory?.id === filter);
    return sortHitsFirst(filtered);
  }, [products, filter]);

  return (
    <div className="shop-catalog">
      <CatalogHero />

      <CatalogFilters
        categories={categories}
        current={filter}
        total={products.length}
        visible={visible.length}
        categoryCounts={categoryCounts}
        onChange={setFilter}
      />

      <CatalogGrid products={visible} filter={filter} categories={categories} />
    </div>
  );
}
