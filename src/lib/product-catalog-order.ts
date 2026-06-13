import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

/** Сортировка каталога: сначала хиты, внутри группы — sortOrder. */
export const productCatalogOrderBy: Prisma.productOrderByWithRelationInput[] = [
  { isHit: 'desc' },
  { sortOrder: 'asc' },
  { createdAt: 'desc' },
];

export async function nextProductSortOrder(isHit: boolean): Promise<number> {
  const agg = await prisma.product.aggregate({
    where: { isHit },
    _max: { sortOrder: true },
  });
  return (agg._max.sortOrder ?? -1) + 1;
}
