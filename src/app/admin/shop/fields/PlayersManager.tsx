// src/app/admin/shop/fields/PlayersManager.tsx - Управление игроками для нанесения
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faSave,
  faTimes,
  faTrash,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DeleteButton from '@/modules/admin/components/DeleteButton';

interface Player {
  id: string;
  name: string;
  number: number;
  isActive: boolean;
}

export default function PlayersManager({ players }: { players: Player[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', number: '' });

  const startEdit = (p: Player) => {
    setEditingId(p.id);
    setForm({ name: p.name, number: p.number.toString() });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({ name: '', number: '' });
  };

  const handleSave = async () => {
    if (!form.name || !form.number) return;

    const body = {
      name: form.name,
      number: parseInt(form.number),
      isActive: true,
    };

    const url =
      editingId && editingId !== 'new'
        ? `/api/players-customization/${editingId}`
        : '/api/players-customization';

    const method = editingId && editingId !== 'new' ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        router.refresh();
        cancelEdit();
      } else {
        const data = await res.json();
        console.error('Ошибка сохранения:', data);
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить игрока?')) return;
    try {
      await fetch(`/api/players-customization/${id}`, { method: 'DELETE' });
      router.refresh();
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  return (
    <div className="border border-white/10 bg-white/5 backdrop-blur-sm p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Добавляйте игроков для быстрого выбора полного нанесения
        </p>
        {!editingId && (
          <Button
            size="sm"
            onClick={() => {
              setEditingId('new');
              setForm({ name: '', number: '' });
            }}
            className="bg-[#ee862c] hover:bg-[#f0ac74]"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Добавить игрока
          </Button>
        )}
      </div>

      {/* Форма добавления/редактирования */}
      {(editingId === 'new' || editingId) && (
        <div className="mb-6 border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <h3 className="text-sm text-white font-medium">
            {editingId === 'new' ? 'Новый игрок' : 'Редактирование'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Фамилия *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border-white/10 bg-white/5 text-white text-sm"
                placeholder="Иванов"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Номер *</label>
              <Input
                type="number"
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
                className="border-white/10 bg-white/5 text-white text-sm"
                placeholder="10"
                min="1"
                max="99"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <FontAwesomeIcon icon={faSave} className="mr-1" /> Сохранить
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={cancelEdit}
              className="border-white/10 text-gray-400"
            >
              <FontAwesomeIcon icon={faTimes} className="mr-1" /> Отмена
            </Button>
          </div>
        </div>
      )}

      {/* Список игроков */}
      <table className="w-full">
        <thead className="border-b border-white/10">
          <tr>
            <th className="p-2 text-left text-sm text-gray-400 w-12">#</th>
            <th className="p-2 text-left text-sm text-gray-400">Фамилия</th>
            <th className="p-2 text-left text-sm text-gray-400">Номер</th>
            <th className="p-2 text-center text-sm text-gray-400 w-24">Действия</th>
          </tr>
        </thead>
        <tbody>
          {players.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                Нет игроков. Добавьте первого.
              </td>
            </tr>
          ) : (
            players.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-2 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-[#ee862c]/20 text-[#ee862c] text-sm font-bold">
                    {p.number}
                  </span>
                </td>
                <td className="p-2 text-white text-sm">{p.name}</td>
                <td className="p-2 text-sm text-gray-400">{p.number}</td>
                <td className="p-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => startEdit(p)}
                      className="text-[#ee862c] hover:text-[#f0ac74] text-sm"
                      title="Редактировать"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                      title="Удалить"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
