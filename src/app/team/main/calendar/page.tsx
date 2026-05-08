// src/app/team/main/calendar/page.tsx - Календарь матчей
import { prisma } from '@/lib/prisma';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faClock, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';

export default async function CalendarPage() {
  const team = await prisma.team.findFirst({ where: { isActive: true } });

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-[#003366]">Календарь матчей</h1>
        <p className="mt-4 text-gray-500">Нет данных. Добавьте команду в админ-панели.</p>
      </div>
    );
  }

  // Будущие матчи
  const upcomingMatches = await prisma.match.findMany({
    where: {
      teamId: team.id,
      matchDate: { gte: new Date() },
    },
    orderBy: { matchDate: 'asc' },
    take: 20,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-[#003366]">
        {team.name} — Календарь матчей
      </h1>

      {upcomingMatches.length === 0 ? (
        <p className="text-center text-gray-500">Нет запланированных матчей</p>
      ) : (
        <div className="space-y-4">
          {upcomingMatches.map((match) => (
            <div
              key={match.id}
              className="rounded-xl bg-white p-5 shadow-md transition-shadow hover:shadow-lg"
            >
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                {/* Дата и время */}
                <div className="text-center sm:text-left">
                  <div className="flex items-center gap-2 text-lg font-bold text-[#003366]">
                    <FontAwesomeIcon icon={faCalendarDays} />
                    {new Date(match.matchDate).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <FontAwesomeIcon icon={faClock} />
                    {new Date(match.matchDate).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {/* Команды */}
                <div className="flex items-center gap-4 text-center">
                  <div className="flex flex-col items-center">
                    {match.homeLogoUrl && (
                      <img src={match.homeLogoUrl} alt="" className="mb-1 h-10 w-10" />
                    )}
                    <span className="font-medium">{match.homeTeam}</span>
                  </div>

                  <div className="text-2xl font-bold text-gray-400">VS</div>

                  <div className="flex flex-col items-center">
                    {match.awayLogoUrl && (
                      <img src={match.awayLogoUrl} alt="" className="mb-1 h-10 w-10" />
                    )}
                    <span className="font-medium">{match.awayTeam}</span>
                  </div>
                </div>

                {/* Место и турнир */}
                <div className="text-center sm:text-right">
                  {match.tournament && (
                    <div className="text-sm text-gray-500">{match.tournament}</div>
                  )}
                  {match.stadium && (
                    <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      {match.stadium}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
