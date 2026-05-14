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
  faChevronLeft,
  faChevronRight,
  faSave,
  faToggleOn,
  faToggleOff,
} from '@fortawesome/free-solid-svg-icons';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
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
  isPublished: boolean;
  isManuallyCreated: boolean;
  teamIds: string[];
}

const levelLabels: Record<string, string> = {
  professional: 'Профессионал',
  amateur: 'Любитель',
};

const genderLabels: Record<string, string> = {
  male: 'Муж.',
  female: 'Жен.',
};

const positionOptions = ['', 'Вратарь', 'Защитник', 'Полузащитник', 'Нападающий'];

const PAGE_SIZE = 50;

interface Props {
  initialPlayers: Player[];
  currentTeamSlug: string;
  currentTeamName: string;
}

export default function PlayersByTeamPageClient({
  initialPlayers,
  currentTeamSlug,
  currentTeamName,
}: Props) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingField, setEditingField] = useState<{
    playerId: string;
    field: 'number' | 'position';
  } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [togglingPublished, setTogglingPublished] = useState<string | null>(null);

  // Быстрое сохранение поля
  const saveField = async (playerId: string, field: 'number' | 'position', value: string) => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      if (field === 'number') {
        body.number = value ? parseInt(value) : null;
      } else {
        body.position = value || null;
      }

      await fetch(`/api/players/${playerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      setPlayers((prev) =>
        prev.map((p) =>
          p.id === playerId
            ? {
                ...p,
                [field]: field === 'number' ? (value ? parseInt(value) : null) : value || null,
              }
            : p
        )
      );
      setEditingField(null);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    } finally {
      setSaving(false);
    }
  };

  // Toggle published
  const togglePublished = async (playerId: string, currentValue: boolean) => {
    setTogglingPublished(playerId);
    try {
      const newValue = !currentValue;
      await fetch(`/api/players/${playerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: newValue }),
      });
      setPlayers((prev) =>
        prev.map((p) => (p.id === playerId ? { ...p, isPublished: newValue } : p))
      );
    } catch (error) {
      console.error('Ошибка переключения:', error);
    } finally {
      setTogglingPublished(null);
    }
  };

  // Поиск
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

  const getLevelBadge = (level: string | null) => {
    if (!level) return null;
    const isPro = level === 'professional';
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase ${
          isPro
            ? 'bg-[#ee862c]/20 text-[#ee862c] border border-[#ee862c]/30'
            : 'bg-white/5 text-gray-400 border border-white/10'
        }`}
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
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase ${
          isMale
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
        }`}
      >
        <FontAwesomeIcon icon={faVenusMars} className="text-[8px]" />
        {genderLabels[gender] || gender}
      </span>
    );
  };

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/admin/players"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-400 border border-white/10 hover:text-white hover:border-white/30 transition-colors"
        >
          <FontAwesomeIcon icon={faUser} className="text-xs" />
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
          <table className="w-full min-w-[700px]">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-gray-400 w-10">#</th>
                <th className="p-3 text-left text-sm font-medium text-gray-400 w-12">Фото</th>
                <th className="p-3 text-left text-sm font-medium text-gray-400">Фамилия Имя</th>
                <th className="p-3 text-center text-sm font-medium text-gray-400 w-16">Номер</th>
                <th className="p-3 text-center text-sm font-medium text-gray-400">Поз.</th>
                <th className="p-3 text-center text-sm font-medium text-gray-400">Уровень</th>
                <th className="p-3 text-center text-sm font-medium text-gray-400">Пол</th>
                <th className="p-3 text-center text-sm font-medium text-gray-400 w-20">Опубл.</th>
                <th className="p-3 text-center text-sm font-medium text-gray-400 w-16">Ред.</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPlayers.map((player, index) => (
                <tr
                  key={player.id}
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors ${
                    !player.isActive ? 'opacity-50' : ''
                  }`}
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
                    </div>
                  </td>
                  {/* Номер */}
                  <td className="p-3 text-center">
                    {editingField?.playerId === player.id && editingField?.field === 'number' ? (
                      <div className="flex items-center gap-1 justify-center">
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-16 h-7 text-xs border-white/10 bg-white/5 text-white text-center"
                          min="1"
                          max="99"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveField(player.id, 'number', editValue);
                            if (e.key === 'Escape') setEditingField(null);
                          }}
                        />
                        <button
                          onClick={() => saveField(player.id, 'number', editValue)}
                          disabled={saving}
                          className="text-green-500 hover:text-green-400"
                        >
                          <FontAwesomeIcon icon={faSave} className="text-xs" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingField({ playerId: player.id, field: 'number' });
                          setEditValue(player.number?.toString() || '');
                        }}
                        className="text-[#ee862c] font-bold hover:underline text-sm"
                      >
                        {player.number || '—'}
                      </button>
                    )}
                  </td>
                  {/* Позиция */}
                  <td className="p-3 text-center">
                    {editingField?.playerId === player.id && editingField?.field === 'position' ? (
                      <div className="flex items-center gap-1 justify-center">
                        <select
                          value={editValue}
                          onChange={(e) => {
                            setEditValue(e.target.value);
                            saveField(player.id, 'position', e.target.value);
                            setEditingField(null);
                          }}
                          className="h-7 text-xs border border-white/10 bg-[#1a1a2e] text-white"
                          autoFocus
                          onBlur={() => setEditingField(null)}
                        >
                          {positionOptions.map((pos) => (
                            <option key={pos} value={pos}>
                              {pos || '—'}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingField({ playerId: player.id, field: 'position' });
                          setEditValue(player.position || '');
                        }}
                        className="text-gray-400 hover:text-white text-sm"
                      >
                        {player.position || '—'}
                      </button>
                    )}
                  </td>
                  <td className="p-3 text-center">{getLevelBadge(player.level)}</td>
                  <td className="p-3 text-center">{getGenderBadge(player.gender)}</td>
                  {/* Опубликован */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => togglePublished(player.id, player.isPublished)}
                      disabled={togglingPublished === player.id}
                      className={`text-xl transition-colors ${
                        togglingPublished === player.id ? 'opacity-50' : ''
                      } ${
                        player.isPublished
                          ? 'text-green-500 hover:text-green-400'
                          : 'text-gray-600 hover:text-gray-400'
                      }`}
                      title={player.isPublished ? 'Скрыть' : 'Опубликовать'}
                    >
                      <FontAwesomeIcon icon={player.isPublished ? faToggleOn : faToggleOff} />
                    </button>
                  </td>
                  {/* Редактировать */}
                  <td className="p-3 text-center">
                    <Link
                      href={`/admin/players/edit/${player.id}?from=${currentTeamSlug}`}
                      className="text-sm text-[#ee862c] hover:underline"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Link>
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
              className={`px-3 py-1 text-sm border ${
                page === currentPage
                  ? 'border-[#ee862c] text-[#ee862c] bg-[#ee862c]/10'
                  : 'border-white/10 text-gray-400 hover:text-white hover:border-white/30'
              }`}
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
