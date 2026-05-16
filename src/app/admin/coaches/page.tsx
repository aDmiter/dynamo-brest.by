// src/app/admin/coaches/page.tsx - Все тренеры
'use client';

import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faSync,
  faToggleOn,
  faToggleOff,
  faUser,
  faPlus,
  faGripVertical,
  faSave,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import ConfirmModal from '@/modules/admin/components/ConfirmModal';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface Team {
  id: string;
  name: string;
  slug: string;
}

interface Coach {
  id: string;
  cometId: string | null;
  firstName: string;
  lastName: string;
  middleName: string | null;
  position: string | null;
  photoUrl: string | null;
  isActive: boolean;
  isPublished: boolean;
  teamIds: string[];
  order: number;
}

export default function CoachesAdminPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  const fetchCoaches = useCallback(async () => {
    const res = await fetch('/api/coaches');
    const data = await res.json();
    setCoaches(
      data.map((c: Coach & { coachTeams?: { team: Team }[] }) => ({
        ...c,
        teamIds: c.coachTeams?.map((ct) => ct.team.id) || [],
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const res = await fetch('/api/coaches');
      const data = await res.json();
      if (!cancelled) {
        setCoaches(
          data.map((c: Coach & { coachTeams?: { team: Team }[] }) => ({
            ...c,
            teamIds: c.coachTeams?.map((ct) => ct.team.id) || [],
          }))
        );
        setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadTeams = async () => {
      const res = await fetch('/api/teams');
      const data = await res.json();
      if (!cancelled) setAllTeams(data);
    };
    loadTeams();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshCoaches = useCallback(async () => {
    const res = await fetch('/api/coaches');
    const data = await res.json();
    setCoaches(
      data.map((c: Coach & { coachTeams?: { team: Team }[] }) => ({
        ...c,
        teamIds: c.coachTeams?.map((ct) => ct.team.id) || [],
      }))
    );
  }, []);

  const handleSync = async () => {
    setShowSyncModal(false);
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/sync/coaches', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncResult(`✅ Готово! Создано: ${data.created}, обновлено: ${data.updated}`);
        await refreshCoaches();
      } else {
        setSyncResult(`❌ Ошибка: ${data.error || 'Неизвестная'}`);
      }
    } catch {
      setSyncResult('❌ Ошибка соединения');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncResult(null), 5000);
    }
  };

  const toggleTeam = async (coachId: string, teamId: string) => {
    setToggling(`${coachId}_${teamId}`);
    const coach = coaches.find((c) => c.id === coachId);
    if (!coach) return;
    const newTeamIds = coach.teamIds.includes(teamId)
      ? coach.teamIds.filter((id) => id !== teamId)
      : [...coach.teamIds, teamId];
    await fetch(`/api/coaches/${coachId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamIds: newTeamIds }),
    });
    setCoaches((prev) => prev.map((c) => (c.id === coachId ? { ...c, teamIds: newTeamIds } : c)));
    setToggling(null);
  };

  const togglePublished = async (coachId: string, value: boolean) => {
    setToggling(`pub_${coachId}`);
    await fetch(`/api/coaches/${coachId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !value }),
    });
    setCoaches((prev) => prev.map((c) => (c.id === coachId ? { ...c, isPublished: !value } : c)));
    setToggling(null);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(coaches);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setCoaches(items);
    setOrderChanged(true);
  };

  const saveOrder = async () => {
    setSavingOrder(true);
    const items = coaches.map((c, i) => ({ id: c.id, order: i }));
    await fetch('/api/coaches/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    setSavingOrder(false);
    setOrderChanged(false);
  };

  const teamShortLabels: Record<string, string> = {
    'osnovnoy-sostav': 'Осн.',
    'dubliruyushchiy-sostav': 'Дуб.',
    'zhenskaya-komanda': 'Жен.',
    administratsiya: 'Адм.',
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Тренеры</h1>
          <p className="text-sm text-gray-400 mt-1">{coaches.length} тренеров</p>
        </div>
        <div className="flex items-center gap-3">
          {orderChanged && (
            <Button
              size="sm"
              onClick={saveOrder}
              disabled={savingOrder}
              style={{ background: 'var(--color-win)' }}
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              {savingOrder ? 'Сохранение...' : 'Сохранить порядок'}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => setShowSyncModal(true)}
            disabled={syncing}
            variant="outline"
            style={{ borderColor: 'var(--color-accent-30)', color: 'var(--color-accent)' }}
          >
            <FontAwesomeIcon icon={faSync} className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Синхронизировать из COMET
          </Button>
          <Link href="/admin/coaches/new">
            <Button size="sm" style={{ background: 'var(--color-accent)' }}>
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Добавить тренера
            </Button>
          </Link>
        </div>
      </div>

      {syncResult && (
        <div
          className={`mb-4 border p-3 text-sm ${syncResult.startsWith('✅') ? 'border-green-500/20 bg-green-500/10 text-green-400' : 'border-red-500/20 bg-red-500/10 text-red-400'}`}
        >
          {syncResult}
        </div>
      )}

      <div className="border border-white/10 bg-white/5 backdrop-blur-sm overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Загрузка...</div>
        ) : coaches.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Нет тренеров. Нажмите «Синхронизировать из COMET».
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <table className="w-full min-w-[700px]">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="p-3 text-left text-sm text-gray-400 w-8"></th>
                  <th className="p-3 text-left text-sm text-gray-400 w-12">Фото</th>
                  <th className="p-3 text-left text-sm text-gray-400">Фамилия Имя</th>
                  <th className="p-3 text-center text-sm text-gray-400">Должность</th>
                  {allTeams.map((team) => (
                    <th key={team.id} className="p-3 text-center text-sm text-gray-400">
                      {teamShortLabels[team.slug] || team.name}
                    </th>
                  ))}
                  <th className="p-3 text-center text-sm text-gray-400 w-20">Опубл.</th>
                  <th className="p-3 text-center text-sm text-gray-400 w-16">Ред.</th>
                </tr>
              </thead>
              <Droppable droppableId="coaches">
                {(provided) => (
                  <tbody ref={provided.innerRef} {...provided.droppableProps}>
                    {coaches.map((coach, index) => (
                      <Draggable key={coach.id} draggableId={coach.id} index={index}>
                        {(provided, snapshot) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`border-b border-white/5 hover:bg-white/5 ${snapshot.isDragging ? 'bg-white/10' : ''}`}
                          >
                            <td className="p-3">
                              <span
                                {...provided.dragHandleProps}
                                className="cursor-grab text-gray-500 hover:text-white"
                              >
                                <FontAwesomeIcon icon={faGripVertical} />
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="h-10 w-10 flex items-center justify-center bg-white/5 overflow-hidden">
                                {coach.photoUrl ? (
                                  <Image
                                    src={coach.photoUrl}
                                    alt=""
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
                              <p className="font-medium text-white">
                                {coach.lastName} {coach.firstName}
                              </p>
                            </td>
                            <td className="p-3 text-center text-sm text-gray-400">
                              {coach.position || '—'}
                            </td>
                            {allTeams.map((team) => {
                              const isOn = coach.teamIds.includes(team.id);
                              return (
                                <td key={team.id} className="p-3 text-center">
                                  <button
                                    onClick={() => toggleTeam(coach.id, team.id)}
                                    disabled={toggling === `${coach.id}_${team.id}`}
                                    className={`text-xl transition-colors ${toggling === `${coach.id}_${team.id}` ? 'opacity-50' : ''} ${isOn ? 'text-green-500 hover:text-green-400' : 'text-gray-600 hover:text-gray-400'}`}
                                  >
                                    <FontAwesomeIcon icon={isOn ? faToggleOn : faToggleOff} />
                                  </button>
                                </td>
                              );
                            })}
                            <td className="p-3 text-center">
                              <button
                                onClick={() => togglePublished(coach.id, coach.isPublished)}
                                disabled={toggling === `pub_${coach.id}`}
                                className={`text-xl transition-colors ${coach.isPublished ? 'text-green-500 hover:text-green-400' : 'text-gray-600 hover:text-gray-400'}`}
                              >
                                <FontAwesomeIcon
                                  icon={coach.isPublished ? faToggleOn : faToggleOff}
                                />
                              </button>
                            </td>
                            <td className="p-3 text-center">
                              <Link
                                href={`/admin/coaches/edit/${coach.id}`}
                                style={{ color: 'var(--color-accent)' }}
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </Link>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </tbody>
                )}
              </Droppable>
            </table>
          </DragDropContext>
        )}
      </div>

      <ConfirmModal
        isOpen={showSyncModal}
        title="Синхронизация с COMET"
        message="Будут загружены тренеры из COMET API. Это может занять некоторое время."
        confirmLabel="Синхронизировать"
        onConfirm={handleSync}
        onCancel={() => setShowSyncModal(false)}
        loading={syncing}
      />
    </div>
  );
}
