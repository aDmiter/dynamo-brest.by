// src/app/school/coaches/page.tsx
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CoachesGrid from '@/modules/team/components/CoachesGrid';

export default async function SchoolCoachesPage() {
  const team = await prisma.team.findUnique({
    where: { slug: 'school' },
  });

  if (!team) notFound();

  const coaches = await prisma.coach.findMany({
    where: {
      isActive: true,
      isPublished: true,
      coachTeams: { some: { teamId: team.id } },
    },
    include: { coachTeams: { include: { team: true } } },
    orderBy: [{ order: 'asc' }, { lastName: 'asc' }],
  });

  return <CoachesGrid coaches={coaches} />;
}
