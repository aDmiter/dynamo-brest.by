'use client';

import { useCallback, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faSave,
  faTrash,
  faUserShield,
  faUserPen,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ADMIN_SECTIONS, type AdminSectionId } from '@/config/admin-sections';
import { SUPERADMIN_ROLE } from '@/lib/admin-permissions';

interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: AdminSectionId[];
  isActive: boolean;
}

interface FormState {
  id?: string;
  email: string;
  name: string;
  password: string;
  role: string;
  permissions: AdminSectionId[];
  isActive: boolean;
}

const emptyForm = (): FormState => ({
  email: '',
  name: '',
  password: '',
  role: 'editor',
  permissions: ['news'],
  isActive: true,
});

interface Props {
  initialUsers: AdminUserRow[];
}

export default function AdminUsersManager({ initialUsers }: Props) {
  const [users, setUsers] = useState<AdminUserRow[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormState | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Не удалось загрузить пользователей');
      }
      setUsers(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, []);

  const togglePermission = (id: AdminSectionId) => {
    if (!form || form.role === SUPERADMIN_ROLE) return;
    setForm((prev) => {
      if (!prev) return prev;
      const has = prev.permissions.includes(id);
      return {
        ...prev,
        permissions: has
          ? prev.permissions.filter((p) => p !== id)
          : [...prev.permissions, id],
      };
    });
  };

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setError('');

    try {
      const isNew = !form.id;
      const body: Record<string, unknown> = {
        email: form.email,
        name: form.name,
        role: form.role,
        isActive: form.isActive,
        permissions: form.role === SUPERADMIN_ROLE ? [] : form.permissions,
      };
      if (form.password) body.password = form.password;

      const res = await fetch(isNew ? '/api/admin/users' : `/api/admin/users/${form.id}`, {
        method: isNew ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Ошибка сохранения');

      setForm(null);
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить пользователя?')) return;
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Ошибка удаления');
      if (form?.id === id) setForm(null);
      await loadUsers();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка удаления');
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-gray-400 max-w-2xl">
          Суперадминистратор управляет учётными записями и назначает доступ к разделам админ-панели.
          Изменения прав применяются при следующем запросе (сессия обновляется автоматически).
        </p>
        <Button
          type="button"
          onClick={() => setForm(emptyForm())}
          className="bg-[#ee862c] hover:bg-[#d67525] text-white"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Добавить пользователя
        </Button>
      </div>

      {form && (
        <div className="border border-white/10 bg-white/5 backdrop-blur-sm p-6 space-y-4">
          <h2 className="text-lg font-medium text-white">
            {form.id ? 'Редактирование' : 'Новый пользователь'}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Имя</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">
                Пароль {form.id ? '(оставьте пустым, чтобы не менять)' : ''}
              </label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Роль</label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value,
                    permissions:
                      e.target.value === SUPERADMIN_ROLE
                        ? []
                        : form.permissions.length
                          ? form.permissions
                          : ['dashboard'],
                  })
                }
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
              >
                <option value="editor">Редактор</option>
                <option value={SUPERADMIN_ROLE}>Суперадминистратор</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded"
            />
            Активен
          </label>

          {form.role !== SUPERADMIN_ROLE && (
            <div>
              <p className="text-sm text-gray-400 mb-3">Доступ к разделам</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {ADMIN_SECTIONS.map((section) => (
                  <label
                    key={section.id}
                    className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.permissions.includes(section.id)}
                      onChange={() => togglePermission(section.id)}
                      className="rounded"
                    />
                    {section.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="bg-[#ee862c] hover:bg-[#d67525] text-white"
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              {saving ? 'Сохранение…' : 'Сохранить'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setForm(null)}
              className="border-white/20 text-gray-300"
            >
              Отмена
            </Button>
          </div>
        </div>
      )}

      <div className="border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">Пользователь</th>
              <th className="px-4 py-3 font-medium">Роль</th>
              <th className="px-4 py-3 font-medium hidden lg:table-cell">Разделы</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium w-28" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Загрузка…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  Нет пользователей
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{user.name}</div>
                    <div className="text-gray-500 text-xs">{user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    <FontAwesomeIcon
                      icon={user.role === SUPERADMIN_ROLE ? faUserShield : faUserPen}
                      className="mr-2 opacity-60"
                    />
                    {user.role === SUPERADMIN_ROLE ? 'Суперадмин' : 'Редактор'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell max-w-md truncate">
                    {user.role === SUPERADMIN_ROLE
                      ? 'Все разделы'
                      : user.permissions.length
                        ? user.permissions
                            .map((id) => ADMIN_SECTIONS.find((s) => s.id === id)?.label ?? id)
                            .join(', ')
                        : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={user.isActive ? 'text-emerald-400' : 'text-gray-500'}>
                      {user.isActive ? 'Активен' : 'Отключён'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setForm({
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            password: '',
                            role: user.role,
                            permissions: user.permissions,
                            isActive: user.isActive,
                          })
                        }
                        className="text-[#ee862c] hover:text-white text-xs"
                      >
                        Изменить
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(user.id)}
                        className="text-red-400 hover:text-red-300 text-xs"
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
    </div>
  );
}
