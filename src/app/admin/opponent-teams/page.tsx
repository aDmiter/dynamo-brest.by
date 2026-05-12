// src/app/admin/opponent-teams/page.tsx - Клубы соперников
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faSync,
  faSearch,
  faTimes,
  faChevronLeft,
  faChevronRight,
  faShieldHalved,
  faSave,
  faTrash,
  faToggleOn,
  faToggleOff,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import ImageUpload from '@/modules/admin/components/ImageUpload';
import ConfirmModal from '@/modules/admin/components/ConfirmModal';

interface OpponentTeam {
  id: string;
  cometId: number | null;
  name: string;
  shortName: string | null;
  logoUrl: string | null;
  city: string | null;
  country: string | null;
  isActive: boolean;
}

const PAGE_SIZE = 50;

export default function OpponentTeamsPage() {
  const [teams, setTeams] = useState<OpponentTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    shortName: '',
    city: '',
    country: '',
    logoUrl: '',
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newForm, setNewForm] = useState({
    name: '',
    shortName: '',
    city: '',
    country: '',
    logoUrl: '',
  });
  const isFirstRender = useRef(true);

  const fetchTeams = useCallback(async (searchTerm: string, pageNum: number) => {
    const params = new URLSearchParams({ page: pageNum.toString(), limit: PAGE_SIZE.toString() });
    if (searchTerm) params.set('search', searchTerm);
    const res = await fetch(`/api/opponent-teams?${params.toString()}`);
    return await res.json();
  }, []);

  const refreshData = useCallback(async () => {
    const data = await fetchTeams(search, page);
    setTeams(data.teams);
    setTotal(data.total);
    setTotalPages(data.totalPages);
  }, [search, page, fetchTeams]);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        const data = await fetchTeams(search, page);
        if (!cancelled) {
          setTeams(data.teams);
          setTotal(data.total);
          setTotalPages(data.totalPages);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    };
    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchTeams(search, page);
        if (!cancelled) {
          setTeams(data.teams);
          setTotal(data.total);
          setTotalPages(data.totalPages);
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [search, page, fetchTeams]);

  const handleSync = async () => {
    setShowSyncModal(false);
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch('/api/sync/matches');
      const data = await res.json();
      if (data.success) {
        setSyncResult('✅ Синхронизация завершена!');
        await refreshData();
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

  const startEdit = (team: OpponentTeam) => {
    setEditingId(team.id);
    setEditForm({
      name: team.name,
      shortName: team.shortName || '',
      city: team.city || '',
      country: team.country || '',
      logoUrl: team.logoUrl || '',
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await fetch(`/api/opponent-teams/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      setEditingId(null);
      await refreshData();
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const toggleActive = async (team: OpponentTeam) => {
    try {
      await fetch(`/api/opponent-teams/${team.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !team.isActive }),
      });
      await refreshData();
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const deleteTeam = async (team: OpponentTeam) => {
    if (!confirm(`Удалить клуб "${team.name}"?`)) return;
    try {
      await fetch(`/api/opponent-teams/${team.id}`, { method: 'DELETE' });
      await refreshData();
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const handleCreate = async () => {
    if (!newForm.name.trim()) return;
    try {
      await fetch('/api/opponent-teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newForm),
      });
      setShowAddModal(false);
      setNewForm({ name: '', shortName: '', city: '', country: '', logoUrl: '' });
      await refreshData();
    } catch (error) {
      console.error('Ошибка создания:', error);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Клубы</h1>
          <p className="text-sm text-gray-400 mt-1">{total} клубов</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => setShowSyncModal(true)}
            disabled={syncing}
            variant="outline"
            className="border-[#ee862c]/30 text-[#ee862c] hover:bg-[#ee862c]/10 hover:border-[#ee862c]"
          >
            <FontAwesomeIcon icon={faSync} className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Синхронизировать из COMET
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="bg-[#ee862c] hover:bg-[#f0ac74]"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Добавить клуб
          </Button>
        </div>
      </div>

      {syncResult && (
        <div
          className={`mb-4 border p-3 text-sm ${syncResult.startsWith('✅') ? 'border-green-500/20 bg-green-500/10 text-green-400' : 'border-red-500/20 bg-red-500/10 text-red-400'}`}
        >
          {syncResult}
        </div>
      )}

      <div className="mb-4 relative">
        <FontAwesomeIcon
          icon={faSearch}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
        />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Поиск по названию..."
          className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-500"
        />
        {search && (
          <button
            onClick={() => {
              setSearch('');
              setPage(1);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}
      </div>

      <div className="border border-white/10 bg-white/5 backdrop-blur-sm overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Загрузка...</div>
        ) : teams.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Нет клубов</div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-gray-400 w-12">#</th>
                <th className="p-3 text-left text-sm font-medium text-gray-400 w-12">Лого</th>
                <th className="p-3 text-left text-sm font-medium text-gray-400">Название</th>
                <th className="p-3 text-left text-sm font-medium text-gray-400">Кратко</th>
                <th className="p-3 text-left text-sm font-medium text-gray-400">Город</th>
                <th className="p-3 text-center text-sm font-medium text-gray-400 w-14">Акт.</th>
                <th className="p-3 text-center text-sm font-medium text-gray-400 w-24">Действия</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <tr
                  key={team.id}
                  className={`border-b border-white/5 hover:bg-white/5 transition-colors ${!team.isActive ? 'opacity-40' : ''}`}
                >
                  <td className="p-3 text-sm text-gray-500">
                    {(page - 1) * PAGE_SIZE + index + 1}
                  </td>
                  <td className="p-3">
                    <div className="h-8 w-8 flex items-center justify-center bg-white/5">
                      {team.logoUrl ? (
                        <Image
                          src={team.logoUrl}
                          alt={team.name}
                          width={32}
                          height={32}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <FontAwesomeIcon icon={faShieldHalved} className="text-gray-600 text-sm" />
                      )}
                    </div>
                  </td>
                  {editingId === team.id ? (
                    <>
                      <td className="p-3">
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="border-white/10 bg-white/5 text-white text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          value={editForm.shortName}
                          onChange={(e) => setEditForm({ ...editForm, shortName: e.target.value })}
                          className="border-white/10 bg-white/5 text-white text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          value={editForm.city}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          className="border-white/10 bg-white/5 text-white text-sm"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleActive(team)}
                          className={`text-xl transition-colors ${team.isActive ? 'text-green-500 hover:text-green-400' : 'text-gray-600 hover:text-gray-400'}`}
                        >
                          <FontAwesomeIcon icon={team.isActive ? faToggleOn : faToggleOff} />
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col gap-2 items-center">
                          <div className="flex items-center gap-2">
                            <Input
                              value={editForm.logoUrl}
                              onChange={(e) =>
                                setEditForm({ ...editForm, logoUrl: e.target.value })
                              }
                              className="border-white/10 bg-white/5 text-white text-xs w-44"
                              placeholder="URL логотипа"
                            />
                          </div>
                          <ImageUpload
                            value={editForm.logoUrl}
                            onChange={(url) => setEditForm({ ...editForm, logoUrl: url })}
                          />
                          <div className="flex items-center gap-1">
                            <button
                              onClick={saveEdit}
                              className="px-2 py-1 text-xs bg-green-600 text-white hover:bg-green-500"
                            >
                              <FontAwesomeIcon icon={faSave} className="mr-1" />
                              Сохр.
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 text-xs border border-white/10 text-gray-400 hover:text-white"
                            >
                              Отм.
                            </button>
                          </div>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-3">
                        <p className="text-white text-sm font-medium">{team.name}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-gray-400 text-sm">{team.shortName || '—'}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-gray-400 text-sm">{team.city || '—'}</p>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleActive(team)}
                          className={`text-xl transition-colors ${team.isActive ? 'text-green-500 hover:text-green-400' : 'text-gray-600 hover:text-gray-400'}`}
                        >
                          <FontAwesomeIcon icon={team.isActive ? faToggleOn : faToggleOff} />
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => startEdit(team)}
                            className="text-sm text-[#ee862c] hover:underline"
                            title="Редактировать"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => deleteTeam(team)}
                            className="text-sm text-red-400 hover:text-red-300"
                            title="Удалить"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 text-sm text-gray-400 border border-white/10 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            let p: number;
            if (totalPages <= 7) p = i + 1;
            else if (page <= 4) p = i + 1;
            else if (page >= totalPages - 3) p = totalPages - 6 + i;
            else p = page - 3 + i;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-3 py-1 text-sm border ${p === page ? 'border-[#ee862c] text-[#ee862c] bg-[#ee862c]/10' : 'border-white/10 text-gray-400 hover:text-white hover:border-white/30'}`}
              >
                {p}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 text-sm text-gray-400 border border-white/10 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
          <span className="text-xs text-gray-500 ml-2">{total} клубов</span>
        </div>
      )}

      <ConfirmModal
        isOpen={showSyncModal}
        title="Синхронизация с COMET"
        message="Будут загружены матчи и клубы соперников. Это может занять некоторое время."
        confirmLabel="Синхронизировать"
        onConfirm={handleSync}
        onCancel={() => setShowSyncModal(false)}
        loading={syncing}
      />

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative z-10 w-full max-w-md border border-white/10 bg-[#242C41]/95 backdrop-blur-xl p-8 shadow-2xl">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <FontAwesomeIcon icon={faTimes} className="text-lg" />
            </button>
            <h3 className="font-heading text-xl font-bold text-white mb-6">Новый клуб</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Логотип</label>
                <div className="mb-3">
                  <ImageUpload
                    value={newForm.logoUrl}
                    onChange={(url) => setNewForm({ ...newForm, logoUrl: url })}
                  />
                </div>
                <Input
                  value={newForm.logoUrl}
                  onChange={(e) => setNewForm({ ...newForm, logoUrl: e.target.value })}
                  className="border-white/10 bg-white/5 text-white text-sm"
                  placeholder="Или вставьте URL..."
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Название *</label>
                <Input
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                  placeholder="БАТЭ"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Краткое</label>
                <Input
                  value={newForm.shortName}
                  onChange={(e) => setNewForm({ ...newForm, shortName: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Город</label>
                <Input
                  value={newForm.city}
                  onChange={(e) => setNewForm({ ...newForm, city: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                  placeholder="Борисов"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Страна</label>
                <Input
                  value={newForm.country}
                  onChange={(e) => setNewForm({ ...newForm, country: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                  placeholder="Беларусь"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreate} className="bg-[#ee862c] hover:bg-[#f0ac74]">
                  Создать
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="border-white/10 text-gray-400 hover:text-white"
                >
                  Отмена
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
