// src/app/admin/matches/[id]/edit/page.tsx - Редактирование матча
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditMatchForm from './EditMatchForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditMatchPage({ params }: Props) {
  const { id } = await params;
  const match = await prisma.match.findUnique({ where: { id } });

  if (!match) notFound();

  const teams = await prisma.team.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  const opponents = await prisma.opponentTeam.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  const serializedMatch = {
    ...match,
    matchDate: match.matchDate.toISOString(),
    createdAt: match.createdAt.toISOString(),
    updatedAt: match.updatedAt.toISOString(),
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Редактирование матча</h1>
      </div>
      <EditMatchForm match={serializedMatch} teams={teams} opponents={opponents} />
    </div>
  );
}
