// src/app/admin/products/page.tsx - Управление товарами
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { productCatalogOrderBy } from '@/lib/product-catalog-order';
import ProductsAdminList from './ProductsAdminList';

export default async function ProductsAdminPage() {
  const products = await prisma.product.findMany({
    orderBy: productCatalogOrderBy,
    include: { productcategory: true, manufacturer: true },
  });

  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    article: p.article,
    price: p.price.toString(),
    images: p.images,
    isHit: p.isHit,
    isFeatured: p.isFeatured,
    sortOrder: p.sortOrder,
    productcategory: p.productcategory,
    manufacturer: p.manufacturer,
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-white">Товары</h1>
        <Link href="/admin/products/new">
          <Button size="sm" className="bg-[#ee862c] hover:bg-[#f0ac74]">
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Добавить товар
          </Button>
        </Link>
      </div>

      <ProductsAdminList initialProducts={rows} />
    </div>
  );
}
