// src/app/admin/sponsors/[id]/page.tsx - Редактирование спонсора
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditSponsorForm from './EditSponsorForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditSponsorPage({ params }: Props) {
  const { id } = await params;
  const sponsor = await prisma.sponsor.findUnique({ where: { id } });
  if (!sponsor) notFound();
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Редактирование спонсора</h1>
      </div>
      <EditSponsorForm sponsor={sponsor} />
    </div>
  );
}
