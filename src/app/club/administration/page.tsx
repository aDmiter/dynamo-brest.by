// src/app/club/administration/page.tsx
import { prisma } from '@/lib/prisma';
import AdministrationGrid from '@/modules/team/components/AdministrationGrid';

export default async function AdministrationPage() {
  const team = await prisma.team.findUnique({
    where: { slug: 'administratsiya' },
  });

  if (!team) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-bg-main)' }}
      >
        <p className="text-xl" style={{ color: 'var(--color-text-stat)' }}>
          Раздел в разработке
        </p>
      </div>
    );
  }

  const members = await prisma.coach.findMany({
    where: {
      isActive: true,
      isPublished: true,
      coachTeams: { some: { teamId: team.id } },
    },
    include: { coachTeams: { include: { team: true } } },
    orderBy: [{ order: 'asc' }, { lastName: 'asc' }],
  });

  return <AdministrationGrid members={members} />;
}
