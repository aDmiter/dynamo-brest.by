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

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="relative h-[40vh] w-full overflow-hidden">
        <img
          src="/images/stadium.jpg"
          alt="Женская команда"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 flex items-center">
          <div className="w-full pl-6 md:pl-36">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-[#ee862c]">
              Команда
            </p>
            <h1
              className="text-4xl leading-tight text-white md:text-6xl lg:text-7xl"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
            >
              Женская команда
            </h1>
          </div>
        </div>
      </div>

      <CoachesGrid coaches={coaches} teamSlug="zhenskaya-komanda" />
    </div>
  );
}
