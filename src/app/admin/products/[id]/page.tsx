// src/app/admin/products/[id]/page.tsx - Редактирование товара
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getAdminPageFlags } from '@/lib/admin-page';
import EditProductForm from './EditProductForm';
import { loadBeFieldsForResource } from '@/lib/content-translations';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      productcategory: true,
      manufacturer: true,
      productsize: { orderBy: [{ sortOrder: 'asc' }, { size: 'asc' }] },
    },
  });

  if (!product) notFound();

  const initialBe = await loadBeFieldsForResource('product', id);
  const { showAudit } = await getAdminPageFlags();

  const serializedProduct = {
    ...product,
    price: product.price.toString(),
    oldPrice: product.oldPrice?.toString() || null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    productsize: product.productsize.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      product: undefined,
    })),
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Редактирование товара</h1>
      </div>
      <EditProductForm product={serializedProduct} initialBe={initialBe} showAudit={showAudit} />
    </div>
  );
}
