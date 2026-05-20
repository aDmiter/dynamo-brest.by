'use client';

import { useCallback, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSave, faTrash, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface PreviewUserRow {
  id: string;
  login: string;
  label: string | null;
  isActive: boolean;
}

interface UserForm {
  id?: string;
  login: string;
  password: string;
  label: string;
  isActive: boolean;
}

const emptyUserForm = (): UserForm => ({
  login: '',
  password: '',
  label: '',
  isActive: true,
});

interface Props {
  initialEnabled: boolean;
  initialMessage: string;
  initialUsers: PreviewUserRow[];
}

export default function SitePreviewAccessAdmin({
  initialEnabled,
  initialMessage,
  initialUsers,
}: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [message, setMessage] = useState(initialMessage);
  const [users, setUsers] = useState<PreviewUserRow[]>(initialUsers);
  const [userForm, setUserForm] = useState<UserForm | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setError('');
    const res = await fetch('/api/admin/site-preview');
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Не удалось загрузить настройки');
    }
    const data = await res.json();
    setEnabled(Boolean(data.enabled));
    setMessage(data.message ?? '');
    setUsers(data.users ?? []);
  }, []);

  const saveSettings = async () => {
    setSavingSettings(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/admin/site-preview', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, message }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Ошибка сохранения');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения');
    } finally {
      setSavingSettings(false);
    }
  };

  const saveUser = async () => {
    if (!userForm) return;
    setSavingUser(true);
    setError('');
    try {
      const isNew = !userForm.id;
      const body: Record<string, unknown> = {
        login: userForm.login,
        label: userForm.label,
        isActive: userForm.isActive,
      };
      if (userForm.password) body.password = userForm.password;

      const res = await fetch(
        isNew ? '/api/admin/site-preview/users' : `/api/admin/site-preview/users/${userForm.id}`,
        {
          method: isNew ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Ошибка сохранения');

      setUserForm(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения');
    } finally {
      setSavingUser(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Удалить доступ?')) return;
    setError('');
    try {
      const res = await fetch(`/api/admin/site-preview/users/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Не удалось удалить');
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка удаления');
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="border border-white/10 bg-white/5 p-6 backdrop-blur-sm space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Закрытый режим сайта</h2>
            <p className="mt-1 text-sm text-gray-400">
              Публичный сайт будет доступен только по логину и паролю. Админка и вход в админку работают
              как обычно.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setEnabled((v) => !v)}
            className={
              enabled
                ? 'border-green-500/50 bg-green-500/10 text-green-400'
                : 'border-white/20 text-gray-400'
            }
          >
            <FontAwesomeIcon icon={enabled ? faEyeSlash : faEye} className="mr-2" />
            {enabled ? 'Сайт закрыт' : 'Сайт открыт'}
          </Button>
        </div>

        <div>
          <label className="mb-2 block text-sm text-gray-400">Текст на странице входа</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-white/10 bg-[#1a1f2e] px-3 py-2 text-sm text-white"
          />
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={saveSettings}
            disabled={savingSettings}
            className="bg-[#ee862c] hover:bg-[#f0ac74]"
          >
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            {savingSettings ? 'Сохранение…' : 'Сохранить режим'}
          </Button>
          {saved && <span className="text-sm text-green-400">Сохранено</span>}
        </div>

        {enabled && (
          <p className="text-xs text-amber-500/90">
            Страница входа:{' '}
            <a href="/preview-login" target="_blank" rel="noreferrer" className="underline">
              /preview-login
            </a>
          </p>
        )}
      </div>

      <div className="border border-white/10 bg-white/5 p-6 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white">Доступы для проверяющих</h2>
          <Button
            type="button"
            variant="outline"
            className="border-white/20 text-gray-300"
            onClick={() => setUserForm(emptyUserForm())}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Добавить доступ
          </Button>
        </div>

        {users.length === 0 ? (
          <p className="text-sm text-gray-500">Нет выданных доступов. Создайте логин и пароль для банка.</p>
        ) : (
          <div className="divide-y divide-white/10">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <div className="font-mono text-white">{user.login}</div>
                  {user.label && <div className="text-xs text-gray-500">{user.label}</div>}
                  {!user.isActive && (
                    <span className="text-[10px] text-amber-500">отключён</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-xs text-[#ee862c] hover:text-white"
                    onClick={() =>
                      setUserForm({
                        id: user.id,
                        login: user.login,
                        password: '',
                        label: user.label ?? '',
                        isActive: user.isActive,
                      })
                    }
                  >
                    Изменить
                  </button>
                  <button
                    type="button"
                    className="text-xs text-red-400 hover:text-red-300"
                    onClick={() => deleteUser(user.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {userForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md border border-white/10 bg-[#0D1225] p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">
              {userForm.id ? 'Изменить доступ' : 'Новый доступ'}
            </h3>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Логин</label>
              <Input
                value={userForm.login}
                onChange={(e) => setUserForm({ ...userForm, login: e.target.value })}
                className="border-white/10 bg-white/5 font-mono text-white"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">
                Пароль {userForm.id && '(оставьте пустым, чтобы не менять)'}
              </label>
              <Input
                type="text"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                className="border-white/10 bg-white/5 font-mono text-white"
                placeholder={userForm.id ? '••••••••' : 'Минимум 6 символов'}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-400">Комментарий (например, «Банк»)</label>
              <Input
                value={userForm.label}
                onChange={(e) => setUserForm({ ...userForm, label: e.target.value })}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={userForm.isActive}
                onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
                className="accent-[#ee862c]"
              />
              Доступ активен
            </label>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={saveUser}
                disabled={savingUser}
                className="bg-[#ee862c] hover:bg-[#f0ac74]"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                {savingUser ? 'Сохранение…' : 'Сохранить'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/20 text-gray-300"
                onClick={() => setUserForm(null)}
              >
                Отмена
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
