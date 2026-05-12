// src/app/admin/players/[teamSlug]/PlayersByTeamPageClient.tsx - Клиентская часть для команды
'use client';

import { useState, useMemo, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faSearch,
  faTimes,
  faUser,
  faVenusMars,
  faLayerGroup,
  faToggleOn,
  faToggleOff,
  faChevronLeft,
  faChevronRight,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import DeleteButton from '@/modules/admin/components/DeleteButton';
import Image from 'next/image';

interface Team {
  id: string;
  name: string;
  slug: string;
}

interface Player {
  id: string;
  cometId: string | null;
  firstName: string;
  lastName: string;
  middleName: string | null;
  number: number | null;
  position: string | null;
  level: string | null;
  gender: string | null;
  photoUrl: string | null;
  isActive: boolean;
  isManuallyCreated: boolean;
  teamIds: string[];
  teams: Team[];
}

const levelLabels: Record<string, string> = {
  professional: 'Профессионал',
  amateur: 'Любитель',
};

const genderLabels: Record<string, string> = {
  male: 'Муж.',
  female: 'Жен.',
};

const teamShortLabels: Record<string, string> = {
  'osnovnoy-sostav': 'Основа',
  'dubliruyushchiy-sostav': 'Дубль',
  'zhenskaya-komanda': 'Женщины',
};

const PAGE_SIZE = 50;

interface Props {
  initialPlayers: Player[];
  allTeams: Team[];
  currentTeamSlug: string;
}

export default function PlayersByTeamPageClient({
  initialPlayers,
  allTeams,
  currentTeamSlug,
}: Props) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [search, setSearch] = useState('');
  const [togglingTeam, setTogglingTeam] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [localToggles, setLocalToggles] = useState<Record<string, string[]>>({});

  const teamToggles = useMemo(() => {
    const toggles: Record<string, Record<string, boolean>> = {};
    players.forEach((p) => {
      const ids = localToggles[p.id] !== undefined ? localToggles[p.id] : p.teamIds;
      toggles[p.id] = {};
      allTeams.forEach((t) => {
        toggles[p.id][t.id] = ids.includes(t.id);
      });
    });
    return toggles;
  }, [players, allTeams, localToggles]);

  const toggleTeam = useCallback(
    async (playerId: string, teamId: string) => {
      const key = `${playerId}_${teamId}`;
      setTogglingTeam(key);

      const current = teamToggles[playerId]?.[teamId] || false;
      const newValue = !current;

      setLocalToggles((prev) => {
        const currentIds =
          prev[playerId] !== undefined
            ? prev[playerId]
            : players.find((p) => p.id === playerId)?.teamIds || [];
        return {
          ...prev,
          [playerId]: newValue ? [...currentIds, teamId] : currentIds.filter((id) => id !== teamId),
        };
      });

      try {
        const player = players.find((p) => p.id === playerId);
        const newTeamIds = newValue
          ? [...(player?.teamIds || []), teamId]
          : (player?.teamIds || []).filter((id) => id !== teamId);

        await fetch(`/api/players/${playerId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamIds: newTeamIds }),
        });

        setPlayers((prev) =>
          prev.map((p) => (p.id === playerId ? { ...p, teamIds: newTeamIds } : p))
        );
        setLocalToggles((prev) => {
          const copy = { ...prev };
          delete copy[playerId];
          return copy;
        });
      } catch (error) {
        console.error('Ошибка переключения команды:', error);
        setLocalToggles((prev) => ({
          ...prev,
          [playerId]: players.find((p) => p.id === playerId)?.teamIds || [],
        }));
      } finally {
        setTogglingTeam(null);
      }
    },
    [players, teamToggles]
  );

  const getLevelBadge = (level: string | null) => {
    if (!level) return null;
    const isPro = level === 'professional';
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase ${isPro ? 'bg-[#ee862c]/20 text-[#ee862c] border border-[#ee862c]/30' : 'bg-white/5 text-gray-400 border border-white/10'}`}
      >
        <FontAwesomeIcon icon={faLayerGroup} className="text-[8px]" />
        {levelLabels[level] || level}
      </span>
    );
  };

  const getGenderBadge = (gender: string | null) => {
    if (!gender) return null;
    const isMale = gender === 'male';
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase ${isMale ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'}`}
      >
        <FontAwesomeIcon icon={faVenusMars} className="text-[8px]" />
        {genderLabels[gender] || gender}
      </span>
    );
  };

  const filteredPlayers = search
    ? players.filter((p) => {
        const fullName = `${p.lastName} ${p.firstName} ${p.middleName || ''}`.toLowerCase();
        return fullName.includes(search.toLowerCase());
      })
    : players;

  const totalPages = Math.ceil(filteredPlayers.length / PAGE_SIZE);
  const paginatedPlayers = filteredPlayers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div>
      {/* Кнопка "Все игроки клуба" */}
      <div className="mb-4">
        <Link
          href="/admin/players"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-400 border border-white/10 hover:text-white hover:border-white/30 transition-colors"
        >
          <FontAwesomeIcon icon={faUsers} className="text-xs" />
          Показать всех игроков клуба
        </Link>
      </div>

      {/* Поиск */}
      <div className="mb-4 relative">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
        />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Поиск по фамилии и имени..."
          className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-500"
        />
        {search && (
          <button
            onClick={() => {
              setSearch('');
              setCurrentPage(1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>

      {/* Таблица */}
      <div className="border border-white/10 bg-white/5 backdrop-blur-sm overflow-x-auto">
        {paginatedPlayers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {search ? 'Ничего не найдено' : 'Нет игроков в этой команде'}
          </div>
        ) : (
          <table className="w-full min-w-[900px]">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-gray-400 w-10">#</th>
                <th className="p-3 text-left text-sm font-medium text-gray-400 w-12">Фото</th>
                <th className="p-3 text-left text-sm font-medium text-gray-400">Фамилия Имя</th>
                <th className="p-3 text-center text-sm font-medium text-gray-400">Уровень</th>
                <th className="p-3 text-center text-sm font-medium text-gray-400">Пол</th>
                <th className="p-3 text-center text-sm font-medium text-gray-400">Поз.</th>
                {allTeams.map((team) => (
                  <th key={team.id} className="p-3 text-center text-sm font-medium text-gray-400">
                    {teamShortLabels[team.slug] || team.name}
                  </th>
                ))}
                <th className="p-3 text-center text-sm font-medium text-gray-400">Действия</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPlayers.map((player, index) => (
                <tr
                  key={player.id}
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors ${!player.isActive ? 'opacity-50' : ''}`}
                >
                  <td className="p-3 text-sm text-gray-500">
                    {(currentPage - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td className="p-3">
                    <div className="h-10 w-10 flex items-center justify-center bg-white/5 overflow-hidden">
                      {player.photoUrl ? (
                        <Image
                          src={player.photoUrl}
                          alt={`${player.lastName} ${player.firstName}`}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FontAwesomeIcon icon={faUser} className="text-gray-600" />
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="font-medium text-white">
                        {player.lastName} {player.firstName}
                      </p>
                      {player.middleName && (
                        <p className="text-xs text-gray-500">{player.middleName}</p>
                      )}
                      {player.number && (
                        <p className="text-xs text-[#ee862c] font-bold">#{player.number}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-center">{getLevelBadge(player.level)}</td>
                  <td className="p-3 text-center">{getGenderBadge(player.gender)}</td>
                  <td className="p-3 text-center text-sm text-gray-400">
                    {player.position || '—'}
                  </td>
                  {allTeams.map((team) => {
                    const isOn = teamToggles[player.id]?.[team.id] || false;
                    const isToggling = togglingTeam === `${player.id}_${team.id}`;
                    return (
                      <td key={team.id} className="p-3 text-center">
                        <button
                          onClick={() => toggleTeam(player.id, team.id)}
                          disabled={isToggling}
                          className={`text-xl transition-colors ${isToggling ? 'opacity-50' : ''} ${isOn ? 'text-green-500 hover:text-green-400' : 'text-gray-600 hover:text-gray-400'}`}
                          title={isOn ? `Убрать из ${team.name}` : `Добавить в ${team.name}`}
                        >
                          <FontAwesomeIcon icon={isOn ? faToggleOn : faToggleOff} />
                        </button>
                      </td>
                    );
                  })}
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/admin/players/edit/${player.id}`}
                        className="text-sm text-[#ee862c] hover:underline"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                      {player.isManuallyCreated && (
                        <DeleteButton
                          id={player.id}
                          apiUrl="/api/players"
                          name={`${player.lastName} ${player.firstName}`}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm text-gray-400 border border-white/10 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 text-sm border ${page === currentPage ? 'border-[#ee862c] text-[#ee862c] bg-[#ee862c]/10' : 'border-white/10 text-gray-400 hover:text-white hover:border-white/30'}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm text-gray-400 border border-white/10 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
          <span className="text-xs text-gray-500 ml-2">{filteredPlayers.length} игроков</span>
        </div>
      )}
    </div>
  );
}
