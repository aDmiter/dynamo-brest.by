// src/app/admin/products/[id]/page.tsx - Редактирование товара
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditProductForm from './EditProductForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { productcategory: true },
  });

  if (!product) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Редактирование товара</h1>
      </div>
      <EditProductForm product={product} />
    </div>
  );
}
