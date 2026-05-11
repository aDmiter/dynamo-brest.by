// src/app/admin/shop/fields/CustomizationsManager.tsx - Управление нанесениями
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ImageUpload from '@/modules/admin/components/ImageUpload';
import DeleteButton from '@/modules/admin/components/DeleteButton';
import ToggleButton from '@/modules/admin/components/ToggleButton';

interface Customization {
  id: string;
  name: string;
  type: string;
  imageUrl: string | null;
  price: { toString: () => string };
  isActive: boolean;
  order: number;
}

export default function CustomizationsManager({
  customizations,
}: {
  customizations: Customization[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ name: '', type: 'fullset', price: '0', imageUrl: '' });

  const startEdit = (item: Customization) => {
    setEditingId(item.id);
    setNewItem({
      name: item.name,
      type: item.type,
      price: item.price.toString(),
      imageUrl: item.imageUrl || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewItem({ name: '', type: 'fullset', price: '0', imageUrl: '' });
  };

  const saveItem = async () => {
    const isNew = editingId === 'new';
    const url = isNew ? '/api/customizations' : `/api/customizations/${editingId}`;
    const method = isNew ? 'POST' : 'PUT';

    const body = {
      name: newItem.name,
      type: newItem.type,
      price: parseFloat(newItem.price) || 0,
      imageUrl: newItem.imageUrl,
      order: 0,
      isActive: true,
    };

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

  const typeLabels: Record<string, string> = {
    fullset: 'Полный комплект',
    logo: 'Логотип',
    flag: 'Флаг',
    text: 'Текст',
  };

  return (
    <div className="border border-white/10 bg-white/5 backdrop-blur-sm p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Добавляйте логотипы спонсоров, флаги, полный комплект и другие элементы нанесения
        </p>
        {!editingId && (
          <Button
            size="sm"
            onClick={() => {
              setEditingId('new');
              setNewItem({ name: '', type: 'fullset', price: '0', imageUrl: '' });
            }}
            className="bg-[#ee862c] hover:bg-[#f0ac74]"
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Добавить
          </Button>
        )}
      </div>

      {/* Форма добавления/редактирования */}
      {(editingId === 'new' || editingId) && (
        <div className="mb-6 border border-white/10 bg-white/[0.03] p-4 space-y-3">
          <h3 className="text-sm text-white font-medium">
            {editingId === 'new' ? 'Новый элемент' : 'Редактирование'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Название *</label>
              <Input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="border-white/10 bg-white/5 text-white text-sm"
                placeholder="Полный комплект"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Тип</label>
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                className="w-full border border-white/10 bg-white/5 p-2 text-sm text-white"
              >
                <option value="fullset">Полный комплект</option>
                <option value="logo">Логотип</option>
                <option value="flag">Флаг</option>
                <option value="text">Текст</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Цена (BYN)</label>
              <Input
                type="number"
                step="0.01"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                className="border-white/10 bg-white/5 text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Картинка</label>
            <ImageUpload
              value={newItem.imageUrl}
              onChange={(url) => setNewItem({ ...newItem, imageUrl: url })}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={saveItem} className="bg-green-600 hover:bg-green-700">
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

      {/* Список нанесений */}
      <table className="w-full">
        <thead className="border-b border-white/10">
          <tr>
            <th className="p-2 text-left text-sm text-gray-400">Название</th>
            <th className="p-2 text-left text-sm text-gray-400">Тип</th>
            <th className="p-2 text-left text-sm text-gray-400">Цена</th>
            <th className="p-2 text-center text-sm text-gray-400">Активен</th>
            <th className="p-2 text-center text-sm text-gray-400 w-24">Действия</th>
          </tr>
        </thead>
        <tbody>
          {customizations.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                Нет элементов. Добавьте первый.
              </td>
            </tr>
          ) : (
            customizations.map((item) => (
              <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-2 text-white text-sm">{item.name}</td>
                <td className="p-2 text-sm text-gray-400">{typeLabels[item.type] || item.type}</td>
                <td className="p-2 text-sm text-white">{Number(item.price).toFixed(2)} BYN</td>
                <td className="p-2 text-center">
                  <ToggleButton
                    id={item.id}
                    apiUrl="/api/customizations"
                    field="isActive"
                    value={item.isActive}
                  />
                </td>
                <td className="p-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="text-[#ee862c] hover:text-[#f0ac74] text-sm"
                      title="Редактировать"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <DeleteButton id={item.id} apiUrl="/api/customizations" name={item.name} />
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
