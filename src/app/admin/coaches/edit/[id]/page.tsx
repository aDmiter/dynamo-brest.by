// src/app/admin/coaches/edit/[id]/page.tsx - Редактирование тренера
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditCoachForm from './EditCoachForm';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCoachPage({ params }: Props) {
  const { id } = await params;

  const coach = await prisma.coach.findUnique({
    where: { id },
    include: {
      coachTeams: { include: { team: true } },
    },
  });

  if (!coach) notFound();

  const allTeams = await prisma.team.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  const serializedCoach = {
    ...coach,
    birthDate: coach.birthDate?.toISOString() || null,
    createdAt: coach.createdAt.toISOString(),
    updatedAt: coach.updatedAt.toISOString(),
    teams: coach.coachTeams.map((ct) => ct.team),
    coachTeams: undefined,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">
          Редактирование тренера: {coach.lastName} {coach.firstName}
        </h1>
      </div>
      <EditCoachForm coach={serializedCoach} allTeams={allTeams} />
    </div>
  );
}
