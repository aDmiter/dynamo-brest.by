// src/app/admin/titles/page.tsx - Управление титулами клуба
import { prisma } from '@/lib/prisma';
import TitlesManager from './TitlesManager';

export default async function TitlesAdminPage() {
  const titles = await prisma.title.findMany({
    orderBy: { year: 'desc' },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white mb-8">Титулы клуба</h1>
      <TitlesManager titles={titles} />
    </div>
  );
}
