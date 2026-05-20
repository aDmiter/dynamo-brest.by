// src/app/team/main/coaches/page.tsx - Тренеры основного состава
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CoachesGrid from '@/modules/team/components/CoachesGrid';

export default async function MainCoachesPage() {
  const team = await prisma.team.findUnique({
    where: { cometId: '68812' },
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
    orderBy: [{ order: 'asc' }, { type: 'asc' }, { lastName: 'asc' }],
  });

  return <CoachesGrid coaches={coaches} />;
}
