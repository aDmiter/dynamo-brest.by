// src/app/admin/categories/[id]/page.tsx - Редактирование категории
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditCategoryForm from './EditCategoryForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await prisma.productcategory.findUnique({ where: { id } });

  if (!category) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Редактирование категории</h1>
      </div>
      <EditCategoryForm category={category} />
    </div>
  );
}
