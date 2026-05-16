// src/app/team/women/coaches/page.tsx - Тренеры женской команды
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CoachesGrid from '@/modules/team/components/CoachesGrid';

export default async function WomenCoachesPage() {
  const team = await prisma.team.findUnique({
    where: { slug: 'zhenskaya-komanda' },
  });

  if (!team) notFound();

  const coaches = await prisma.coach.findMany({
    where: {
      isActive: true,
      isPublished: true,
      coachTeams: {
        some: { teamId: team.id },
      },
    },
    include: {
      coachTeams: {
        include: { team: true },
      },
    },
    orderBy: [{ type: 'asc' }, { lastName: 'asc' }],
  });

  return <CoachesGrid coaches={coaches} />;
}
