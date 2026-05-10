// src/app/admin/banners/[id]/page.tsx - Редактирование баннера
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditBannerForm from './EditBannerForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBannerPage({ params }: Props) {
  const { id } = await params;
  const banner = await prisma.banner.findUnique({ where: { id } });

  if (!banner) notFound();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Редактирование баннера</h1>
      </div>
      <EditBannerForm banner={banner} />
    </div>
  );
}
