'use client';

import { useCallback, useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faGripLines,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TipTapEditor from '@/modules/admin/components/TipTapEditor';
import ImageUpload from '@/modules/admin/components/ImageUpload';
import ClubHistoryImagesEditor, {
  type HistoryImageItem,
} from '@/modules/admin/components/ClubHistoryImagesEditor';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import AdminAuditMeta from '@/modules/admin/components/AdminAuditMeta';
import { formatAdminAuditDate } from '@/lib/admin-audit';

type YearImage = {
  id: string;
  yearId: string;
  url: string;
  alt: string;
  sortOrder: number;
};

type YearRow = {
  id: string;
  label: string;
  year: number;
  sortOrder: number;
  highlight: boolean;
  contentHtml: string;
  isActive: boolean;
  images: YearImage[];
  createdAt?: string;
  updatedAt?: string;
  createdByName?: string | null;
  updatedByName?: string | null;
};

type IntroRow = {
  id: string;
  contentHtml: string;
  coverUrl: string | null;
  updatedAt?: string;
  updatedByName?: string | null;
};

const emptyYearForm = {
  label: '',
  year: new Date().getFullYear(),
  highlight: false,
  contentHtml: '',
  isActive: true,
  images: [] as HistoryImageItem[],
};

export default function ClubHistoryAdmin({ showAudit = false }: { showAudit?: boolean }) {
  const [intro, setIntro] = useState<IntroRow | null>(null);
  const [years, setYears] = useState<YearRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIntro, setSavingIntro] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyYearForm);
  const [savingYear, setSavingYear] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/club-history');
    const data = await res.json();
    setIntro(data.intro);
    setYears(data.years ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveIntro = async () => {
    if (!intro) return;
    setSavingIntro(true);
    await fetch('/api/admin/club-history/intro', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contentHtml: intro.contentHtml,
        coverUrl: intro.coverUrl,
      }),
    });
    setSavingIntro(false);
  };

  const openNewYear = () => {
    setEditingId(null);
    setForm({ ...emptyYearForm, year: new Date().getFullYear() });
    setModalOpen(true);
  };

  const openEditYear = (row: YearRow) => {
    setEditingId(row.id);
    setForm({
      label: row.label,
      year: row.year,
      highlight: row.highlight,
      contentHtml: row.contentHtml,
      isActive: row.isActive,
      images: row.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
      })),
    });
    setModalOpen(true);
  };

  const saveYear = async () => {
    if (!form.label.trim()) return;
    setSavingYear(true);

    const payload = {
      label: form.label.trim(),
      year: form.year,
      highlight: form.highlight,
      contentHtml: form.contentHtml,
      isActive: form.isActive,
      images: form.images.map((img, index) => ({
        url: img.url,
        alt: img.alt,
        sortOrder: index,
      })),
    };

    const url =
      editingId === null
        ? '/api/admin/club-history/years'
        : `/api/admin/club-history/years/${editingId}`;
    const method = editingId === null ? 'POST' : 'PUT';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setSavingYear(false);
    setModalOpen(false);
    await load();
  };

  const deleteYear = async (id: string) => {
    if (!confirm('Удалить этот год из истории?')) return;
    await fetch(`/api/admin/club-history/years/${id}`, { method: 'DELETE' });
    await load();
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const list = Array.from(years);
    const [moved] = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, moved);
    setYears(list);

    await fetch('/api/admin/club-history/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: list.map((item, index) => ({ id: item.id, sortOrder: index })),
      }),
    });
  };

  if (loading) {
    return <p className="text-gray-400">Загрузка…</p>;
  }

  return (
    <div className="space-y-8">
      <section className="border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold text-white">Вступление на странице</h2>
        {intro && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm text-gray-400">Баннер (необязательно)</label>
              <ImageUpload
                value={intro.coverUrl ?? ''}
                onChange={(url) => setIntro({ ...intro, coverUrl: url || null })}
                folder="admin"
                storage="club-history"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-gray-400">Текст вступления</label>
              <TipTapEditor
                content={intro.contentHtml}
                onChange={(html) => setIntro({ ...intro, contentHtml: html })}
              />
            </div>
            <Button
              onClick={saveIntro}
              disabled={savingIntro}
              className="bg-[#ee862c] hover:bg-[#f0ac74]"
            >
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              {savingIntro ? 'Сохранение…' : 'Сохранить вступление'}
            </Button>
            {showAudit && intro && (
              <AdminAuditMeta
                className="mt-4"
                showCreated={false}
                record={{
                  updatedAt: intro.updatedAt,
                  updatedByName: intro.updatedByName,
                }}
              />
            )}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Годы истории</h2>
          <Button onClick={openNewYear} className="bg-[#ee862c] hover:bg-[#f0ac74]">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Добавить год истории
          </Button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="club-history-years">
            {(provided) => (
              <ul
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-2"
              >
                {years.map((row, index) => (
                  <Draggable key={row.id} draggableId={row.id} index={index}>
                    {(dragProvided) => (
                      <li
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        className="flex items-center gap-3 border border-white/10 bg-[#1a1f2e] p-4"
                      >
                        <span
                          {...dragProvided.dragHandleProps}
                          className="cursor-grab text-gray-500"
                        >
                          <FontAwesomeIcon icon={faGripLines} />
                        </span>
                        {row.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={row.images[0].url}
                            alt=""
                            className="h-14 w-20 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-20 items-center justify-center rounded bg-white/5 text-xs text-gray-500">
                            Нет фото
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white">{row.label}</p>
                          <p className="text-xs text-gray-500">
                            {row.year}
                            {row.highlight ? ' · веха' : ''}
                            {!row.isActive ? ' · скрыт' : ''}
                            {row.images.length > 1
                              ? ` · +${row.images.length - 1} в галерее`
                              : ''}
                          </p>
                          {showAudit && (row.createdByName || row.updatedByName) && (
                            <p className="text-[10px] text-gray-600 mt-1">
                              {row.createdByName && `Создал: ${row.createdByName}`}
                              {row.updatedByName && (
                                <>
                                  {row.createdByName ? ' · ' : ''}
                                  Правил: {row.updatedByName}
                                </>
                              )}
                              {row.updatedAt && ` · ${formatAdminAuditDate(row.updatedAt)}`}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => openEditYear(row)}
                          className="text-gray-400 hover:text-white"
                          aria-label="Редактировать"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteYear(row.id)}
                          className="text-gray-400 hover:text-red-400"
                          aria-label="Удалить"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>

        {years.length === 0 && (
          <p className="mt-4 text-sm text-gray-500">
            Пока нет годов. Нажмите «Добавить год истории» или выполните{' '}
            <code className="text-[#ee862c]">npx tsx prisma/seed-club-history.ts</code> для
            импорта из статического файла.
          </p>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-white/10 bg-[#0D1225] p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {editingId ? 'Редактировать год' : 'Новый год истории'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Название</label>
                <Input
                  value={form.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    const match = label.match(/\d{4}/);
                    setForm({
                      ...form,
                      label,
                      year: match ? parseInt(match[0], 10) : form.year,
                    });
                  }}
                  placeholder="2022 год"
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Год (для фильтра)</label>
                  <Input
                    type="number"
                    value={form.year}
                    onChange={(e) =>
                      setForm({ ...form, year: parseInt(e.target.value, 10) || form.year })
                    }
                    className="border-white/10 bg-white/5 text-white"
                  />
                </div>
                <div className="flex flex-col justify-end gap-2">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={form.highlight}
                      onChange={(e) => setForm({ ...form, highlight: e.target.checked })}
                      className="accent-[#ee862c]"
                    />
                    Выделить в хронологии
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="accent-[#ee862c]"
                    />
                    Показывать на сайте
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">Текст сезона</label>
                <TipTapEditor
                  content={form.contentHtml}
                  onChange={(html) => setForm({ ...form, contentHtml: html })}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">Фотографии</label>
                <ClubHistoryImagesEditor
                  images={form.images}
                  onChange={(images) => setForm({ ...form, images })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={saveYear}
                  disabled={savingYear || !form.label.trim()}
                  className="bg-[#ee862c] hover:bg-[#f0ac74]"
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  {savingYear ? 'Сохранение…' : 'Сохранить'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="border-white/10 text-gray-400"
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
