// src/app/admin/settings/menu/page.tsx - Управление главным меню
'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faChevronRight,
  faChevronDown,
  faGripLines,
  faExternalLinkAlt,
  faFileAlt,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TipTapEditor from '@/modules/admin/components/TipTapEditor';

interface MenuItem {
  id: string;
  title: string;
  slug: string;
  type: string;
  linkUrl: string | null;
  pageContent: string | null;
  parentId: string | null;
  order: number;
  isActive: boolean;
  isExternal: boolean;
  icon: string | null;
  children: MenuItem[];
}

export default function MenuAdminPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    slug: '',
    type: 'link',
    linkUrl: '',
    pageContent: '',
    parentId: '',
    isActive: true,
    isExternal: false,
    order: 0,
  });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Загрузка меню
  useEffect(() => {
    let cancelled = false;

    const loadMenu = async () => {
      const res = await fetch('/api/menu');
      const data = await res.json();
      if (!cancelled) {
        setMenu(data);
        setLoading(false);
      }
    };

    loadMenu();

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshMenu = async () => {
    const res = await fetch('/api/menu');
    const data = await res.json();
    setMenu(data);
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setEditForm({
      title: item.title,
      slug: item.slug,
      type: item.type,
      linkUrl: item.linkUrl || '',
      pageContent: item.pageContent || '',
      parentId: item.parentId || '',
      isActive: item.isActive,
      isExternal: item.isExternal,
      order: item.order,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const url = editingId === 'new' ? '/api/menu' : `/api/menu/${editingId}`;
    const method = editingId === 'new' ? 'POST' : 'PUT';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    refreshMenu();
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Удалить пункт меню и все дочерние?')) return;
    await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    refreshMenu();
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Главное меню</h1>
          <p className="text-sm text-gray-400 mt-1">Управление пунктами меню сайта</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingId('new');
            setEditForm({
              title: '',
              slug: '',
              type: 'link',
              linkUrl: '',
              pageContent: '',
              parentId: '',
              isActive: true,
              isExternal: false,
              order: 0,
            });
          }}
          className="bg-[#ee862c] hover:bg-[#f0ac74]"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Добавить пункт
        </Button>
      </div>

      {/* Форма редактирования */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setEditingId(null)}
          />
          <div className="relative z-10 w-full max-w-2xl border border-white/10 bg-[#242C41]/95 backdrop-blur-xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingId(null)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <FontAwesomeIcon icon={faTimes} className="text-lg" />
            </button>
            <h3 className="font-heading text-xl font-bold text-white mb-6">
              {editingId === 'new' ? 'Новый пункт меню' : 'Редактирование'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Название *</label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Slug (URL)</label>
                <Input
                  value={editForm.slug}
                  onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Тип</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
                    <input
                      type="radio"
                      checked={editForm.type === 'link'}
                      onChange={() => setEditForm({ ...editForm, type: 'link' })}
                      className="accent-[#ee862c]"
                    />
                    Ссылка
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white cursor-pointer">
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
                  <label className="text-sm text-gray-400 mb-1 block">URL</label>
                  <Input
                    value={editForm.linkUrl}
                    onChange={(e) => setEditForm({ ...editForm, linkUrl: e.target.value })}
                    className="border-white/10 bg-white/5 text-white"
                    placeholder="/team/main/players"
                  />
                  <label className="flex items-center gap-2 mt-2 text-sm text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isExternal}
                      onChange={(e) => setEditForm({ ...editForm, isExternal: e.target.checked })}
                      className="accent-[#ee862c]"
                    />
                    Открывать в новой вкладке
                  </label>
                </div>
              ) : (
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Содержимое страницы</label>
                  <TipTapEditor
                    content={editForm.pageContent}
                    onChange={(html) => setEditForm({ ...editForm, pageContent: html })}
                  />
                </div>
              )}

              <div>
                <label className="text-sm text-gray-400 mb-1 block">Родительский пункт</label>
                <select
                  value={editForm.parentId}
                  onChange={(e) => setEditForm({ ...editForm, parentId: e.target.value })}
                  className="w-full border border-white/10 bg-[#1a1a2e] p-2 text-sm text-white"
                >
                  <option value="">— Корневой уровень —</option>
                  {menu.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="accent-[#ee862c]"
                  />
                  Активен
                </label>
              </div>

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

      {/* Список меню */}
      <div className="border border-white/10 bg-white/5 backdrop-blur-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Загрузка...</div>
        ) : (
          <div>
            {menu.map((item) => (
              <MenuItemRow
                key={item.id}
                item={item}
                level={0}
                expanded={expanded}
                onToggleExpand={toggleExpand}
                onEdit={startEdit}
                onDelete={deleteItem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Компонент строки меню
function MenuItemRow({
  item,
  level,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
}: {
  item: MenuItem;
  level: number;
  expanded: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
}) {
  const hasChildren = item.children?.length > 0;
  const isOpen = expanded[item.id];

  return (
    <>
      <div
        className={`border-b border-white/5 hover:bg-white/5 transition-colors ${!item.isActive ? 'opacity-50' : ''}`}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        <div className="flex items-center gap-3 p-3">
          {hasChildren && (
            <button
              onClick={() => onToggleExpand(item.id)}
              className="text-gray-400 hover:text-white w-4"
            >
              <FontAwesomeIcon icon={isOpen ? faChevronDown : faChevronRight} className="text-xs" />
            </button>
          )}
          {!hasChildren && <span className="w-4" />}

          <span className="text-gray-500 mr-2">
            <FontAwesomeIcon icon={faGripLines} className="text-xs" />
          </span>

          <span className="flex-1 text-white text-sm font-medium">{item.title}</span>

          <span className="text-xs text-gray-500 mr-2">
            {item.type === 'page' ? (
              <FontAwesomeIcon icon={faFileAlt} className="mr-1" />
            ) : item.isExternal ? (
              <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-1" />
            ) : null}
            {item.type === 'link' ? item.linkUrl || '—' : 'Страница'}
          </span>

          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(item)} className="text-sm text-[#ee862c] hover:underline">
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="text-sm text-red-400 hover:text-red-300"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        </div>
      </div>

      {isOpen &&
        hasChildren &&
        item.children.map((child) => (
          <MenuItemRow
            key={child.id}
            item={child}
            level={level + 1}
            expanded={expanded}
            onToggleExpand={onToggleExpand}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </>
  );
}
