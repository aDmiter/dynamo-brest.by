'use client';

import { useCallback, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotate, faSave, faSearch, faXmark } from '@fortawesome/free-solid-svg-icons';
import { SITE_PAGE_TEMPLATE_PLACEHOLDERS } from '@/config/site-page-templates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function templatePlaceholderHint(path: string): string[] | null {
  if (path === '/team/player/[slug]') return SITE_PAGE_TEMPLATE_PLACEHOLDERS.player;
  if (path === '/news/[slug]') return SITE_PAGE_TEMPLATE_PLACEHOLDERS.news;
  if (path === '/shop/product/[slug]') return SITE_PAGE_TEMPLATE_PLACEHOLDERS.product;
  if (path === '/page/[slug]') return SITE_PAGE_TEMPLATE_PLACEHOLDERS['cms-page'];
  if (path === '/legal/[slug]') return SITE_PAGE_TEMPLATE_PLACEHOLDERS['legal-page'];
  return null;
}

interface SitePageRow {
  id: string;
  path: string;
  label: string;
  source: string;
  title: string | null;
  description: string | null;
  redirectTo: string | null;
  visitCount: number;
  defaultTitle: string | null;
  defaultDescription: string | null;
  isTemplate: boolean;
}

interface EditForm {
  title: string;
  description: string;
  redirectTo: string;
}

interface Props {
  initialPages: SitePageRow[];
}

export default function SitePageMetaAdmin({ initialPages }: Props) {
  const [pages, setPages] = useState<SitePageRow[]>(initialPages);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<SitePageRow | null>(null);
  const [form, setForm] = useState<EditForm>({ title: '', description: '', redirectTo: '' });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/site-pages');
      if (!res.ok) throw new Error('Не удалось загрузить список страниц');
      setPages(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, []);

  const syncRegistry = async () => {
    setSyncing(true);
    setError('');
    try {
      const res = await fetch('/api/admin/site-pages', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка синхронизации');
      setPages(data.pages ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка синхронизации');
    } finally {
      setSyncing(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter(
      (p) =>
        p.path.toLowerCase().includes(q) ||
        p.label.toLowerCase().includes(q) ||
        (p.title ?? '').toLowerCase().includes(q)
    );
  }, [pages, query]);

  const openEdit = (row: SitePageRow) => {
    setEditing(row);
    setForm({
      title: row.title ?? '',
      description: row.description ?? '',
      redirectTo: row.redirectTo ?? '',
    });
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/site-pages/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка сохранения');
      setPages((prev) => prev.map((p) => (p.id === editing.id ? data : p)));
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по URL или названию…"
            className="border-white/10 bg-white/5 pl-10 text-white"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={syncRegistry}
          disabled={syncing}
          className="border-white/20 text-gray-300"
        >
          <FontAwesomeIcon icon={faRotate} className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
          Обновить список страниц
        </Button>
      </div>

      <p className="text-sm text-gray-400">
        Укажите title и description для SEO. Поле «Новый URL» задаёт публичный адрес страницы: старый
        путь будет перенаправлять на новый, новый адрес откроет ту же страницу, ссылки в меню
        обновятся автоматически. Можно указать внешний URL (https://…) — тогда сработает только
        редирект. Счётчик визитов ведётся по исходной строке в таблице. Для всех игроков сразу —
        строка «Игрок (шаблон)»; для одного игрока — его URL после «Обновить список страниц».
      </p>

      <div className="border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-white/5 text-left text-gray-400">
            <tr>
              <th className="p-3 font-medium">Страница</th>
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Новый URL</th>
              <th className="p-3 font-medium text-right">Визиты</th>
              <th className="p-3 w-24" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Загрузка…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Ничего не найдено
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="hover:bg-white/5">
                  <td className="p-3">
                    <div className="font-medium text-white">{row.label}</div>
                    <div className="text-xs text-gray-500 font-mono">{row.path}</div>
                    {row.isTemplate && (
                      <span className="text-[10px] text-amber-500/80">шаблон</span>
                    )}
                  </td>
                  <td className="p-3 text-gray-400 max-w-xs truncate">
                    {row.title || row.defaultTitle || '—'}
                  </td>
                  <td className="p-3 text-gray-400 font-mono text-xs max-w-[160px] truncate">
                    {row.redirectTo || '—'}
                  </td>
                  <td className="p-3 text-right text-gray-300 tabular-nums">
                    {row.isTemplate ? '—' : row.visitCount.toLocaleString('ru-RU')}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      className="text-[#ee862c] hover:text-white text-xs"
                    >
                      Изменить
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg border border-white/10 bg-[#0D1225] p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Meta и URL</h3>
                <p className="text-sm text-gray-500 font-mono mt-1">{editing.path}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="text-gray-400 hover:text-white"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {editing.isTemplate && templatePlaceholderHint(editing.path) && (
              <div className="rounded border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-gray-400 space-y-1">
                <p className="text-amber-500/90">Подстановки в title и description:</p>
                <p className="font-mono text-gray-300">
                  {templatePlaceholderHint(editing.path)!.join(', ')}
                </p>
              </div>
            )}

            {(editing.defaultTitle || editing.defaultDescription) && (
              <div className="rounded border border-white/10 bg-white/5 p-3 text-xs text-gray-500 space-y-1">
                <p className="text-gray-400">Значения по умолчанию из кода:</p>
                {editing.defaultTitle && <p>Title: {editing.defaultTitle}</p>}
                {editing.defaultDescription && <p>Description: {editing.defaultDescription}</p>}
              </div>
            )}

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Title</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="border-white/10 bg-white/5 text-white"
                placeholder={editing.defaultTitle ?? 'Заголовок вкладки браузера'}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                placeholder={editing.defaultDescription ?? 'Meta description'}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Новый публичный URL</label>
              <Input
                value={form.redirectTo}
                onChange={(e) => setForm({ ...form, redirectTo: e.target.value })}
                className="border-white/10 bg-white/5 text-white font-mono text-xs"
                placeholder="/новый-путь или https://…"
                disabled={editing.isTemplate}
              />
              {editing.isTemplate && (
                <p className="text-xs text-gray-500 mt-1">
                  Для шаблонов смена URL недоступна — настройте конкретную страницу.
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                disabled={saving}
                onClick={save}
                className="bg-[#ee862c] hover:bg-[#d67525] text-white"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                {saving ? 'Сохранение…' : 'Сохранить'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(null)}
                className="border-white/20 text-gray-300"
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
