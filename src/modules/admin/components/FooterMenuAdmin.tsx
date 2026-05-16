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
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TipTapEditor from '@/modules/admin/components/TipTapEditor';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface FooterMenuItem {
  id: string;
  block: number;
  title: string;
  slug: string;
  type: string;
  linkUrl: string | null;
  pageContent: string | null;
  order: number;
  isActive: boolean;
  isExternal: boolean;
}

interface FooterContacts {
  id: string;
  title: string;
  email: string;
  addressLabel: string;
  address: string;
}

const emptyForm = {
  title: '',
  slug: '',
  block: 1,
  type: 'page' as string,
  linkUrl: '',
  pageContent: '',
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

export default function FooterMenuAdmin() {
  const [items, setItems] = useState<FooterMenuItem[]>([]);
  const [contacts, setContacts] = useState<FooterContacts | null>(null);
  const [contactsForm, setContactsForm] = useState({
    title: 'Контакты',
    email: 'info@dynamo-brest.by',
    addressLabel: 'Адрес офиса в Бресте',
    address: 'г. Брест, ул. Гоголя, 9',
  });
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [savingContacts, setSavingContacts] = useState(false);

  const loadData = useCallback(async () => {
    const res = await fetch('/api/footer-menu');
    const data = await res.json();
    setItems(data.items);
    if (data.contacts) {
      setContacts(data.contacts);
      setContactsForm({
        title: data.contacts.title,
        email: data.contacts.email,
        addressLabel: data.contacts.addressLabel,
        address: data.contacts.address,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const blockItems = (block: number) => items.filter((i) => i.block === block);

  const startEdit = (item: FooterMenuItem) => {
    setEditingId(item.id);
    setEditForm({
      title: item.title,
      slug: item.slug,
      block: item.block,
      type: item.type,
      linkUrl: item.linkUrl || '',
      pageContent: item.pageContent || '',
      isActive: item.isActive,
      isExternal: item.isExternal,
    });
  };

  const startNew = (block: number) => {
    setEditingId('new');
    setEditForm({ ...emptyForm, block });
  };

  const saveEdit = async () => {
    const payload = {
      ...editForm,
      slug: editForm.slug || slugify(editForm.title),
    };

    if (editingId === 'new') {
      await fetch('/api/footer-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else if (editingId) {
      await fetch(`/api/footer-menu/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    setEditingId(null);
    await loadData();
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Удалить пункт нижнего меню?')) return;
    await fetch(`/api/footer-menu/${id}`, { method: 'DELETE' });
    await loadData();
  };

  const handleDragEnd = async (block: number, result: DropResult) => {
    if (!result.destination) return;

    const list = Array.from(blockItems(block));
    const [moved] = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, moved);

    const updates = list.map((item, index) => ({ id: item.id, order: index }));

    const other = items.filter((i) => i.block !== block);
    const reordered = [...other, ...list.map((item, index) => ({ ...item, order: index }))];
    setItems(reordered.sort((a, b) => a.block - b.block || a.order - b.order));

    await fetch('/api/footer-menu/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: updates }),
    });
    await loadData();
  };

  const saveContacts = async () => {
    setSavingContacts(true);
    await fetch('/api/footer-contacts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactsForm),
    });
    setSavingContacts(false);
    await loadData();
  };

  const renderBlock = (block: number, label: string) => {
    const list = blockItems(block);

    return (
      <div className="border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-white">{label}</h2>
          <Button
            size="sm"
            onClick={() => startNew(block)}
            className="bg-[#ee862c] hover:bg-[#f0ac74]"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            Добавить
          </Button>
        </div>

        <DragDropContext onDragEnd={(result) => handleDragEnd(block, result)}>
          <Droppable droppableId={`footer-block-${block}`}>
            {(provided) => (
              <ul ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {list.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(dragProvided) => (
                      <li
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        className="flex items-center gap-3 border border-white/10 bg-[#1a1f2e] p-3"
                      >
                        <span
                          {...dragProvided.dragHandleProps}
                          className="cursor-grab text-gray-500"
                        >
                          <FontAwesomeIcon icon={faGripLines} />
                        </span>
                        <FontAwesomeIcon
                          icon={item.type === 'page' ? faFileAlt : faExternalLinkAlt}
                          className="text-[#ee862c]/80"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{item.title}</p>
                          <p className="truncate text-xs text-gray-500">
                            {item.type === 'page'
                              ? `/legal/${item.slug}`
                              : item.linkUrl}
                          </p>
                        </div>
                        {!item.isActive && (
                          <span className="text-xs text-gray-500">скрыт</span>
                        )}
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="text-gray-400 hover:text-white"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteItem(item.id)}
                          className="text-gray-400 hover:text-red-400"
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

        {list.length === 0 && (
          <p className="text-sm text-gray-500">Пунктов пока нет</p>
        )}
      </div>
    );
  };

  if (loading) {
    return <p className="text-gray-400">Загрузка...</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-white">Нижнее меню</h1>
        <p className="mt-1 text-sm text-gray-400">
          Пункты в подвале сайта: два блока ссылок и блок контактов
        </p>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {renderBlock(1, 'Блок 1')}
        {renderBlock(2, 'Блок 2')}
      </div>

      <div className="border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 font-heading text-lg font-bold text-white">Блок 3 — Контакты</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-gray-400">Заголовок</label>
            <Input
              value={contactsForm.title}
              onChange={(e) => setContactsForm({ ...contactsForm, title: e.target.value })}
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Email</label>
            <Input
              value={contactsForm.email}
              onChange={(e) => setContactsForm({ ...contactsForm, email: e.target.value })}
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Подпись адреса</label>
            <Input
              value={contactsForm.addressLabel}
              onChange={(e) =>
                setContactsForm({ ...contactsForm, addressLabel: e.target.value })
              }
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-400">Адрес</label>
            <Input
              value={contactsForm.address}
              onChange={(e) => setContactsForm({ ...contactsForm, address: e.target.value })}
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
        </div>
        <Button
          onClick={saveContacts}
          disabled={savingContacts}
          className="mt-4 bg-[#ee862c] hover:bg-[#f0ac74]"
        >
          <FontAwesomeIcon icon={faSave} className="mr-2" />
          Сохранить контакты
        </Button>
        {contacts && (
          <p className="mt-2 text-xs text-gray-500">
            Обновлено: {new Date(contacts.updatedAt).toLocaleString('ru-RU')}
          </p>
        )}
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
            <h3 className="mb-6 font-heading text-xl font-bold text-white">
              {editingId === 'new' ? 'Новый пункт' : 'Редактирование'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Блок</label>
                <select
                  value={editForm.block}
                  onChange={(e) =>
                    setEditForm({ ...editForm, block: Number(e.target.value) })
                  }
                  className="w-full border border-white/10 bg-[#1a1a2e] p-2 text-sm text-white"
                >
                  <option value={1}>Блок 1</option>
                  <option value={2}>Блок 2</option>
                </select>
              </div>

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

              <div>
                <label className="mb-1 block text-sm text-gray-400">Slug (URL)</label>
                <Input
                  value={editForm.slug}
                  onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                  placeholder="obrashcheniya-grazhdan"
                />
                {editForm.type === 'page' && (
                  <p className="mt-1 text-xs text-gray-500">
                    Страница: /legal/{editForm.slug || '…'}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-400">Тип</label>
                <div className="flex gap-4">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
                    <input
                      type="radio"
                      checked={editForm.type === 'page'}
                      onChange={() => setEditForm({ ...editForm, type: 'page' })}
                      className="accent-[#ee862c]"
                    />
                    Текстовая страница
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-white">
                    <input
                      type="radio"
                      checked={editForm.type === 'link'}
                      onChange={() => setEditForm({ ...editForm, type: 'link' })}
                      className="accent-[#ee862c]"
                    />
                    Ссылка
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
                    placeholder="https://..."
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
