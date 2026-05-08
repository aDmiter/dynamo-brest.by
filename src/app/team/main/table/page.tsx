// src/app/team/main/table/page.tsx - Турнирная таблица
import { prisma } from '@/lib/prisma';

export default async function TablePage() {
  // Получаем последнюю запись из Standings, группируем по tournamentId
  const standings = await prisma.standings.findMany({
    orderBy: { position: 'asc' },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-[#003366]">Турнирная таблица</h1>

      {standings.length === 0 ? (
        <p className="text-center text-gray-500">Нет данных турнирной таблицы</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow-md">
          <table className="w-full">
            <thead className="bg-[#003366] text-white">
              <tr>
                <th className="p-3 text-left">#</th>
                <th className="p-3 text-left">Команда</th>
                <th className="p-3 text-center">И</th>
                <th className="p-3 text-center">В</th>
                <th className="p-3 text-center">Н</th>
                <th className="p-3 text-center">П</th>
                <th className="p-3 text-center">М</th>
                <th className="p-3 text-center">О</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row) => (
                <tr
                  key={row.id}
                  className={`border-b hover:bg-gray-50 ${
                    row.teamName.includes('Динамо-Брест') ? 'bg-blue-50 font-semibold' : ''
                  }`}
                >
                  <td className="p-3">{row.position}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {row.teamLogoUrl && <img src={row.teamLogoUrl} alt="" className="h-6 w-6" />}
                      {row.teamName}
                    </div>
                  </td>
                  <td className="p-3 text-center">{row.played}</td>
                  <td className="p-3 text-center">{row.won}</td>
                  <td className="p-3 text-center">{row.drawn}</td>
                  <td className="p-3 text-center">{row.lost}</td>
                  <td className="p-3 text-center">
                    {row.goalsFor}–{row.goalsAgainst}
                  </td>
                  <td className="p-3 text-center font-bold">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
