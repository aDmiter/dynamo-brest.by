// src/app/team/main/results/page.tsx - Результаты матчей
import { prisma } from '@/lib/prisma';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons';

export default async function ResultsPage() {
  const team = await prisma.team.findFirst({ where: { isActive: true } });

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-[#003366]">Результаты матчей</h1>
        <p className="mt-4 text-gray-500">Нет данных. Добавьте команду в админ-панели.</p>
      </div>
    );
  }

  // Прошедшие матчи
  const pastMatches = await prisma.match.findMany({
    where: {
      teamId: team.id,
      matchDate: { lt: new Date() },
    },
    orderBy: { matchDate: 'desc' },
    take: 20,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-[#003366]">
        {team.name} — Результаты матчей
      </h1>

      {pastMatches.length === 0 ? (
        <p className="text-center text-gray-500">Нет прошедших матчей</p>
      ) : (
        <div className="space-y-3">
          {pastMatches.map((match) => (
            <div
              key={match.id}
              className="flex flex-col items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-md sm:flex-row"
            >
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FontAwesomeIcon icon={faCalendarDays} />
                {new Date(match.matchDate).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                })}
              </div>

              <div className="flex items-center gap-4">
                <span className="font-medium">{match.homeTeam}</span>
                <span className="rounded-lg bg-[#003366] px-3 py-1 text-lg font-bold text-white">
                  {match.homeScore ?? '—'} : {match.awayScore ?? '—'}
                </span>
                <span className="font-medium">{match.awayTeam}</span>
              </div>

              <div className="text-sm text-gray-500">
                {match.tournament || ''}
                {match.round ? ` • ${match.round} тур` : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
