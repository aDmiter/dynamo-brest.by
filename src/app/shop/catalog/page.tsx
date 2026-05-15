// src/app/shop/catalog/page.tsx
import { prisma } from '@/lib/prisma';
import CatalogClient from './CatalogClient';

export default async function CatalogPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { inStock: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { productcategory: true },
    }),
    prisma.productcategory.findMany({
      orderBy: { order: 'asc' },
    }),
  ]);

  const serialized = products.map((p) => ({
    ...p,
    price: p.price.toString(),
    oldPrice: p.oldPrice?.toString() || null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return <CatalogClient products={serialized} categories={categories} />;
}
