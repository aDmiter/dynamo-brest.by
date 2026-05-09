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

  if (!banner) {
    notFound();
  }

  // Статистика кликов по дням (за последние 30 дней)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#003366]">Редактирование баннера</h1>
      </div>

      <EditBannerForm banner={banner} />
    </div>
  );
}
