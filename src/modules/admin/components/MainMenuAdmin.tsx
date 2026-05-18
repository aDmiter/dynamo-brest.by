'use client';

import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faGripLines,
  faExternalLinkAlt,
  faFileAlt,
  faLayerGroup,
  faBolt,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ImageUpload from '@/modules/admin/components/ImageUpload';
import TipTapEditor from '@/modules/admin/components/TipTapEditor';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { CODED_MENU_ROUTES } from '@/config/coded-menu-routes';

export interface MenuItem {
  id: string;
  title: string;
  slug: string;
  type: string;
  linkUrl: string | null;
  pageContent: string | null;
  imageUrl: string | null;
  subtitle: string | null;
  parentId: string | null;
  order: number;
  isActive: boolean;
  isExternal: boolean;
  icon: string | null;
  children: MenuItem[];
}

const QUICK_CHILD_LINKS: { title: string; slug: string; linkUrl: string }[] = [
  { title: 'Билеты', slug: 'menu-link-tickets', linkUrl: '/page/tickets' },
  { title: 'Зал', slug: 'menu-link-gym', linkUrl: '/services/gym' },
  { title: 'Поля', slug: 'menu-link-fields', linkUrl: '/services/fields' },
  { title: 'Транспорт', slug: 'menu-link-transport', linkUrl: '/page/services-transport' },
  { title: 'Состав', slug: 'menu-link-players', linkUrl: '/team/main/players' },
  { title: 'Магазин', slug: 'menu-link-shop', linkUrl: '/shop/catalog' },
  { title: 'Доставка', slug: 'menu-link-shop-delivery', linkUrl: '/shop/delivery' },
  { title: 'Оплата', slug: 'menu-link-shop-payment', linkUrl: '/shop/payment' },
  { title: 'Возврат', slug: 'menu-link-shop-returns', linkUrl: '/shop/returns' },
];

const emptyForm = {
  title: '',
  slug: '',
  type: 'link' as string,
  linkUrl: '',
  pageContent: '',
  imageUrl: '',
  subtitle: '',
  parentId: '',
  isActive: true,
  isExternal: false,
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9а-яё-]/gi, '');
}

function getItemUrlPreview(item: Pick<MenuItem, 'type' | 'slug' | 'linkUrl'>): string {
  if (item.type === 'page') return `/page/${item.slug}`;
  return item.linkUrl || '—';
}

export default function MainMenuAdmin() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editContext, setEditContext] = useState<'section' | 'child'>('section');

  const loadMenu = useCallback(async () => {
    const res = await fetch('/api/menu');
    const data = await res.json();
    setMenu(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const startEditSection = (item: MenuItem) => {
    setEditingId(item.id);
    setEditContext('section');
    setEditForm({
      title: item.title,
      slug: item.slug,
      type: item.type,
      linkUrl: item.linkUrl || '',
      pageContent: item.pageContent || '',
      imageUrl: item.imageUrl || '',
      subtitle: item.subtitle || '',
      parentId: '',
      isActive: item.isActive,
      isExternal: item.isExternal,
    });
  };

  const startEditChild = (item: MenuItem) => {
    setEditingId(item.id);
    setEditContext('child');
    setEditForm({
      title: item.title,
      slug: item.slug,
      type: item.type,
      linkUrl: item.linkUrl || '',
      pageContent: item.pageContent || '',
      imageUrl: item.imageUrl || '',
      subtitle: item.subtitle || '',
      parentId: item.parentId || '',
      isActive: item.isActive,
      isExternal: item.isExternal,
    });
  };

  const startNewSection = () => {
    setEditingId('new');
    setEditContext('section');
    setEditForm({ ...emptyForm, parentId: '' });
  };

  const startNewChild = (sectionId: string) => {
    setEditingId('new');
    setEditContext('child');
    setEditForm({ ...emptyForm, parentId: sectionId, type: 'link' });
  };

  const saveEdit = async () => {
    const payload = {
      ...editForm,
      slug: editForm.slug || slugify(editForm.title),
      parentId: editContext === 'section' ? null : editForm.parentId || null,
    };

    const url = editingId === 'new' ? '/api/menu' : `/api/menu/${editingId}`;
    const method = editingId === 'new' ? 'POST' : 'PUT';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    setEditingId(null);
    await loadMenu();
  };

  const deleteItem = async (id: string, withChildren: boolean) => {
    const msg = withChildren
      ? 'Удалить раздел и все подпункты внутри?'
      : 'Удалить пункт меню?';
    if (!confirm(msg)) return;
    await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    await loadMenu();
  };

  const handleReorder = async (items: { id: string; order: number }[]) => {
    await fetch('/api/menu/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    await loadMenu();
  };

  const handleSectionDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const list = Array.from(menu);
    const [moved] = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, moved);
    setMenu(list);
    await handleReorder(list.map((item, index) => ({ id: item.id, order: index })));
  };

  const handleChildDragEnd = async (sectionId: string, result: DropResult) => {
    if (!result.destination) return;
    const section = menu.find((s) => s.id === sectionId);
    if (!section) return;

    const list = Array.from(section.children);
    const [moved] = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, moved);

    setMenu((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, children: list } : s)),
    );

    await handleReorder(list.map((item, index) => ({ id: item.id, order: index })));
  };

  const addQuickChild = async (sectionId: string, preset: (typeof QUICK_CHILD_LINKS)[0]) => {
    const section = menu.find((s) => s.id === sectionId);
    const order = section?.children.length ?? 0;

    await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: preset.title,
        slug: `${preset.slug}-${Date.now()}`,
        type: 'link',
        linkUrl: preset.linkUrl,
        parentId: sectionId,
        order,
        isActive: true,
        isExternal: false,
      }),
    });
    await loadMenu();
  };

  const renderChildRow = (child: MenuItem, index: number) => (
    <Draggable key={child.id} draggableId={child.id} index={index}>
      {(dragProvided) => (
        <li
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          className="flex items-center gap-3 border border-white/10 bg-[#1a1f2e] p-3"
        >
          <span {...dragProvided.dragHandleProps} className="cursor-grab text-gray-500">
            <FontAwesomeIcon icon={faGripLines} />
          </span>
          <FontAwesomeIcon
            icon={child.type === 'page' ? faFileAlt : faExternalLinkAlt}
            className="text-[#ee862c]/80"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{child.title}</p>
            <p className="truncate text-xs text-gray-500">{getItemUrlPreview(child)}</p>
          </div>
          {!child.isActive && <span className="text-xs text-gray-500">скрыт</span>}
          <button
            type="button"
            onClick={() => startEditChild(child)}
            className="text-gray-400 hover:text-white"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            type="button"
            onClick={() => deleteItem(child.id, false)}
            className="text-gray-400 hover:text-red-400"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </li>
      )}
    </Draggable>
  );

  const renderSection = (section: MenuItem, index: number) => (
    <Draggable key={section.id} draggableId={`section-${section.id}`} index={index}>
      {(dragProvided) => (
        <div
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          className={`border border-white/10 bg-white/5 p-6 ${!section.isActive ? 'opacity-60' : ''}`}
        >
          <div className="mb-4 flex items-start gap-3">
            <span {...dragProvided.dragHandleProps} className="mt-1 cursor-grab text-gray-500">
              <FontAwesomeIcon icon={faGripLines} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <FontAwesomeIcon icon={faLayerGroup} className="text-[#ee862c]/80" />
                <h2 className="font-heading text-lg font-bold text-white">{section.title}</h2>
                <span className="rounded bg-white/10 px-2 py-0.5 text-xs text-gray-400">
                  {section.children.length}{' '}
                  {section.children.length === 1
                    ? 'подпункт'
                    : section.children.length < 5
                      ? 'подпункта'
                      : 'подпунктов'}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-gray-500">{getItemUrlPreview(section)}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => startEditSection(section)}
                className="rounded p-2 text-gray-400 hover:bg-white/10 hover:text-white"
                title="Настройки раздела"
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button
                type="button"
                onClick={() => deleteItem(section.id, true)}
                className="rounded p-2 text-gray-400 hover:bg-white/10 hover:text-red-400"
                title="Удалить раздел"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>

          <DragDropContext onDragEnd={(result) => handleChildDragEnd(section.id, result)}>
            <Droppable droppableId={`menu-children-${section.id}`}>
              {(provided) => (
                <ul
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="mb-4 space-y-2"
                >
                  {section.children.map((child, childIndex) =>
                    renderChildRow(child, childIndex),
                  )}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>

          {section.children.length === 0 && (
            <p className="mb-4 text-sm text-gray-500">Подпунктов пока нет</p>
          )}

          <div className="mb-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => startNewChild(section.id)}
              className="border-white/10 text-gray-300 hover:text-white"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Подпункт
            </Button>
          </div>

          <div className="border-t border-white/10 pt-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              <FontAwesomeIcon icon={faBolt} className="text-[#ee862c]/70" />
              Быстро добавить
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_CHILD_LINKS.map((preset) => (
                <button
                  key={preset.slug}
                  type="button"
                  onClick={() => addQuickChild(section.id, preset)}
                  className="rounded border border-white/10 bg-[#1a1f2e] px-2.5 py-1 text-xs text-gray-300 transition-colors hover:border-[#ee862c]/40 hover:text-white"
                >
                  + {preset.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );

  if (loading) {
    return <p className="text-gray-400">Загрузка...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Главное меню</h1>
          <p className="mt-1 text-sm text-gray-400">
            Разделы бургер-меню и подпункты внутри каждого блока
          </p>
        </div>
        <Button
          size="sm"
          onClick={startNewSection}
          className="bg-[#ee862c] hover:bg-[#f0ac74]"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Добавить раздел
        </Button>
      </div>

      {menu.length === 0 ? (
        <div className="border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-gray-400">Разделов пока нет. Создайте первый блок меню.</p>
          <Button onClick={startNewSection} className="mt-4 bg-[#ee862c] hover:bg-[#f0ac74]">
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Добавить раздел
          </Button>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleSectionDragEnd}>
          <Droppable droppableId="menu-sections">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="mb-8 grid gap-6 lg:grid-cols-2"
              >
                {menu.map((section, index) => renderSection(section, index))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <div className="border border-white/10 bg-white/5 p-6">
        <h2 className="mb-2 font-heading text-lg font-bold text-white">Подсказка</h2>
        <p className="text-sm leading-relaxed text-gray-400">
          Страницы, свёрстанные в коде (билеты, зал, поля, транспорт), добавляйте как тип{' '}
          <strong className="text-gray-300">«Ссылка»</strong> с точным URL. Тип{' '}
          <strong className="text-gray-300">«Текстовая страница»</strong> — для контента из
          редактора на <code className="text-[#ee862c]/90">/page/[slug]</code>.
        </p>
        <ul className="mt-3 space-y-1 text-xs text-gray-500">
          {Object.entries(CODED_MENU_ROUTES).map(([slug, path]) => (
            <li key={slug}>
              <code className="text-[#ee862c]/80">{path}</code>
              <span className="text-gray-600"> — slug: {slug}</span>
            </li>
          ))}
        </ul>
      </div>

      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setEditingId(null)}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-white/10 bg-[#242C41]/95 p-8 shadow-2xl backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <FontAwesomeIcon icon={faTimes} className="text-lg" />
            </button>
            <h3 className="mb-1 font-heading text-xl font-bold text-white">
              {editingId === 'new'
                ? editContext === 'section'
                  ? 'Новый раздел'
                  : 'Новый подпункт'
                : editContext === 'section'
                  ? 'Раздел меню'
                  : 'Подпункт меню'}
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              {editContext === 'section'
                ? 'Колонка в бургер-меню'
                : 'Ссылка внутри выбранного раздела'}
            </p>

            <div className="space-y-4">
              {editContext === 'child' && (
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Раздел</label>
                  <select
                    value={editForm.parentId}
                    onChange={(e) => setEditForm({ ...editForm, parentId: e.target.value })}
                    className="w-full border border-white/10 bg-[#1a1a2e] p-2 text-sm text-white"
                  >
                    {menu.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm text-gray-400">Название *</label>
                <Input
                  value={editForm.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    setEditForm({
                      ...editForm,
                      title,
                      slug:
                        editingId === 'new' && !editForm.slug
                          ? slugify(title)
                          : editForm.slug,
                    });
                  }}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>

              {editContext === 'section' && (
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Подзаголовок</label>
                  <Input
                    value={editForm.subtitle}
                    onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                    className="border-white/10 bg-white/5 text-white"
                    placeholder="Динамо-Брест"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm text-gray-400">Slug (URL)</label>
                <Input
                  value={editForm.slug}
                  onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                />
                {editForm.type === 'page' && (
                  <p className="mt-1 text-xs text-gray-500">
                    Страница: /page/{editForm.slug || '…'}
                  </p>
                )}
              </div>

              {editContext === 'section' && editForm.type === 'page' && (
                <div>
                  <label className="mb-2 block text-sm text-gray-400">Баннер страницы</label>
                  <ImageUpload
                    value={editForm.imageUrl}
                    onChange={(url) => setEditForm({ ...editForm, imageUrl: url })}
                    folder="headers"
                  />
                  <p className="mt-1 text-xs text-gray-500">Рекомендуемый размер: 1920×1080px</p>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm text-gray-400">Тип</label>
                <div className="flex gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
                    <input
                      type="radio"
                      checked={editForm.type === 'link'}
                      onChange={() => setEditForm({ ...editForm, type: 'link' })}
                      className="accent-[#ee862c]"
                    />
                    Ссылка
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
                    <input
                      type="radio"
                      checked={editForm.type === 'page'}
                      onChange={() => setEditForm({ ...editForm, type: 'page' })}
                      className="accent-[#ee862c]"
                    />
                    Текстовая страница
                  </label>
                </div>
              </div>

              {editForm.type === 'link' ? (
                <div>
                  <label className="mb-1 block text-sm text-gray-400">URL</label>
                  <Input
                    value={editForm.linkUrl}
                    onChange={(e) => setEditForm({ ...editForm, linkUrl: e.target.value })}
                    className="border-white/10 bg-white/5 text-white"
                    placeholder="/team/main/players"
                  />
                  <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-gray-400">
                    <input
                      type="checkbox"
                      checked={editForm.isExternal}
                      onChange={(e) =>
                        setEditForm({ ...editForm, isExternal: e.target.checked })
                      }
                      className="accent-[#ee862c]"
                    />
                    Открывать в новой вкладке
                  </label>
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Содержимое</label>
                  <TipTapEditor
                    content={editForm.pageContent}
                    onChange={(html) => setEditForm({ ...editForm, pageContent: html })}
                  />
                </div>
              )}

              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="accent-[#ee862c]"
                />
                Активен
              </label>

              <div className="flex gap-3 pt-4">
                <Button onClick={saveEdit} className="bg-[#ee862c] hover:bg-[#f0ac74]">
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  Сохранить
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingId(null)}
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
