// src/app/shop/catalog/page.tsx
import { prisma } from '@/lib/prisma';
import { getSiteLangFromCookies } from '@/lib/content-translations-server';
import { localizeProducts } from '@/lib/content-translations';
import { productCatalogOrderBy } from '@/lib/product-catalog-order';
import CatalogClient from './CatalogClient';

export default async function CatalogPage() {
  const lang = await getSiteLangFromCookies();

  const [productsRaw, categories] = await Promise.all([
    prisma.product.findMany({
      where: { inStock: true },
      orderBy: productCatalogOrderBy,
      take: 50,
      include: { productcategory: true, manufacturer: true },
    }),
    prisma.productcategory.findMany({
      orderBy: { order: 'asc' },
    }),
  ]);

  const products = await localizeProducts(productsRaw, lang);

  const serialized = products.map((p) => ({
    ...p,
    price: p.price.toString(),
    oldPrice: p.oldPrice?.toString() || null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return <CatalogClient products={serialized} categories={categories} />;
}
