// src/modules/team/components/PlayersGrid.tsx - Сетка игроков с группировкой по позициям
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

interface PlayerData {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  number: number | null;
  position: string | null;
  photoUrl: string | null;
  birthDate: Date | null;
  nationality: string | null;
  height: number | null;
  weight: number | null;
}

interface Props {
  players: PlayerData[];
}

const positionLabels: Record<string, string> = {
  Вратарь: 'Вратари',
  Защитник: 'Защитники',
  Полузащитник: 'Полузащитники',
  Нападающий: 'Нападающие',
};

export default function PlayersGrid({ players }: Props) {
  const groupedPlayers: Record<string, PlayerData[]> = {};

  for (const player of players) {
    const position = player.position || 'Другие';
    if (!groupedPlayers[position]) {
      groupedPlayers[position] = [];
    }
    groupedPlayers[position].push(player);
  }

  const positionOrder = ['Вратарь', 'Защитник', 'Полузащитник', 'Нападающий'];

  return (
    <div className="py-16">
      <div className="mx-auto w-full pl-20 pr-4 md:pl-28">
        {players.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-xl text-gray-500">Состав пока не заполнен</p>
          </div>
        ) : (
          <div className="flex flex-col gap-16">
            {positionOrder.map((position) => {
              const playersInPosition = groupedPlayers[position];
              if (!playersInPosition || playersInPosition.length === 0) return null;

              return (
                <div key={position}>
                  <h2
                    className="mb-6 text-2xl font-black uppercase tracking-wider text-white"
                    style={{ fontFamily: "'Inter Tight', sans-serif" }}
                  >
                    {positionLabels[position] || position}
                  </h2>

                  <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-px bg-white/5">
                    {playersInPosition.map((player) => (
                      <PlayerCard key={player.id} player={player} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Карточка игрока
function PlayerCard({ player }: { player: PlayerData }) {
  return (
    <div className="player-card group relative bg-[#0d1117] overflow-hidden transition-colors hover:bg-[#111827]">
      {/* Фото */}
      <div className="player-card__photo relative w-full aspect-[3/4] overflow-hidden bg-[#1a1f2e]">
        {player.photoUrl ? (
          <img
            src={player.photoUrl}
            alt={`${player.lastName} ${player.firstName}`}
            className="player-card__photo-image absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <FontAwesomeIcon icon={faUser} className="text-6xl text-gray-600" />
          </div>
        )}

        {/* Номер */}
        {player.number && (
          <div className="player-card__number absolute right-3 top-3 z-10">
            <span
              className="text-5xl font-black leading-none text-[#ee862c]/30"
              style={{ fontFamily: "'Inter Tight', sans-serif" }}
            >
              {player.number}
            </span>
          </div>
        )}

        {/* Градиент снизу */}
        <div className="player-card__gradient absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d1117] to-transparent" />
      </div>

      {/* Инфо */}
      <div className="player-card__info p-4">
        <h3 className="player-card__lastname text-2xl font-black uppercase text-white leading-tight">
          {player.lastName}
        </h3>
        <p className="player-card__firstname mt-0.5 text-sm text-gray-400">{player.firstName}</p>

        <div className="player-card__details mt-3 flex flex-wrap gap-1.5">
          {player.nationality && (
            <span className="border border-white/10 px-2 py-0.5 text-[11px] text-gray-500">
              {player.nationality}
            </span>
          )}
          {player.birthDate && (
            <span className="border border-white/10 px-2 py-0.5 text-[11px] text-gray-500">
              {new Date(player.birthDate).toLocaleDateString('ru-RU')}
            </span>
          )}
          {player.height && (
            <span className="border border-white/10 px-2 py-0.5 text-[11px] text-gray-500">
              {player.height} см
            </span>
          )}
          {player.weight && (
            <span className="border border-white/10 px-2 py-0.5 text-[11px] text-gray-500">
              {player.weight} кг
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
