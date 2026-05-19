// src/app/admin/news/[id]/page.tsx - Редактирование новости
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { getAdminPageFlags } from '@/lib/admin-page';
import EditNewsForm from './EditNewsForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditNewsPage({ params }: Props) {
  const { id } = await params;
  const news = await prisma.news.findUnique({ where: { id } });

  if (!news) notFound();

  const { showAudit } = await getAdminPageFlags();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Редактирование новости</h1>
      </div>
      <EditNewsForm
        news={{
          ...news,
          publishedAt: news.publishedAt,
        }}
        showAudit={showAudit}
      />
    </div>
  );
}
