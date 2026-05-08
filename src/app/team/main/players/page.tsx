// src/app/team/main/players/page.tsx - Основной состав
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faShirt, faFlag } from '@fortawesome/free-solid-svg-icons';

export default async function PlayersPage() {
  // Получаем первую активную команду
  const team = await prisma.team.findFirst({
    where: { isActive: true },
    include: {
      players: {
        where: { isActive: true },
        orderBy: { number: 'asc' },
      },
    },
  });

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-[#003366]">Состав команды</h1>
        <p className="mt-4 text-gray-500">Нет данных. Добавьте команду в админ-панели.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-[#003366]">
        {team.name} — Основной состав
      </h1>

      {team.players.length === 0 ? (
        <p className="text-center text-gray-500">Состав пока не заполнен</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {team.players.map((player) => (
            <div
              key={player.id}
              className="rounded-xl bg-white p-5 shadow-md transition-shadow hover:shadow-lg"
            >
              {/* Фото игрока */}
              <div className="mx-auto mb-4 flex h-40 w-40 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                {player.photoUrl ? (
                  <Image
                    src={player.photoUrl}
                    alt={`${player.lastName} ${player.firstName}`}
                    width={160}
                    height={160}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FontAwesomeIcon icon={faUser} className="text-5xl text-gray-400" />
                )}
              </div>

              {/* Имя */}
              <h3 className="text-center text-lg font-bold text-[#003366]">{player.lastName}</h3>
              <p className="text-center text-sm text-gray-600">
                {player.firstName} {player.middleName || ''}
              </p>

              {/* Информация */}
              <div className="mt-3 space-y-1 text-sm">
                {player.number && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FontAwesomeIcon icon={faShirt} className="w-4 text-[#003366]" />
                    <span>Номер: {player.number}</span>
                  </div>
                )}
                {player.position && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="inline-block rounded bg-[#003366]/10 px-2 py-0.5 text-xs text-[#003366]">
                      {player.position}
                    </span>
                  </div>
                )}
                {player.nationality && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FontAwesomeIcon icon={faFlag} className="w-4 text-[#003366]" />
                    <span>{player.nationality}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
