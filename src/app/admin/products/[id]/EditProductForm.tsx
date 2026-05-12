// src/app/admin/products/[id]/EditProductForm.tsx - Форма редактирования товара
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSave,
  faArrowLeft,
  faTrash,
  faPlus,
  faTimes,
  faEdit,
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import ImageUpload from '@/modules/admin/components/ImageUpload';

interface Product {
  id: string;
  name: string;
  article: string | null;
  description: string;
  composition: string | null;
  price: string;
  oldPrice: string | null;
  categoryId: string;
  images: string | null;
  inStock: boolean;
  isFeatured: boolean;
  hasCustomization?: boolean;
  productcategory?: { id: string; name: string } | null;
  productsize: { id: string; size: string; quantity: number }[];
}

export default function EditProductForm({ product }: { product: Product }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const [form, setForm] = useState({
    name: product.name,
    article: product.article || '',
    description: product.description,
    composition: product.composition || '',
    price: product.price,
    oldPrice: product.oldPrice || '',
    categoryId: product.categoryId,
    images: (product.images ? JSON.parse(product.images) : []) as string[],
    inStock: product.inStock,
    isFeatured: product.isFeatured,
  });

  // Состояние для размеров - добавляем поддержку редактирования quantity
  const [sizes, setSizes] = useState<{ size: string; quantity: number }[]>(
    product.productsize?.map((s) => ({ size: s.size, quantity: s.quantity })) || []
  );

  // Состояние для отслеживания, какой размер редактируется
  const [editingSize, setEditingSize] = useState<string | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<number>(0);

  const [newSize, setNewSize] = useState('');
  const [newSizeQty, setNewSizeQty] = useState(1);
  const [hasCustomization, setHasCustomization] = useState(product.hasCustomization || false);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  const addImage = (url: string) => setForm({ ...form, images: [...form.images, url] });
  const removeImage = (i: number) =>
    setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) });

  // Начать редактирование количества
  const startEditQuantity = (size: string, currentQuantity: number) => {
    setEditingSize(size);
    setEditingQuantity(currentQuantity);
  };

  // Сохранить изменённое количество
  const saveQuantityEdit = () => {
    if (editingSize !== null && editingQuantity >= 0) {
      setSizes(
        sizes.map((s) => (s.size === editingSize ? { ...s, quantity: editingQuantity } : s))
      );
      setEditingSize(null);
      setEditingQuantity(0);
    }
  };

  // Отменить редактирование
  const cancelEdit = () => {
    setEditingSize(null);
    setEditingQuantity(0);
  };

  const addSize = () => {
    if (newSize.trim() && newSizeQty > 0) {
      const existing = sizes.find((s) => s.size === newSize.trim());
      if (existing)
        setSizes(
          sizes.map((s) =>
            s.size === newSize.trim() ? { ...s, quantity: s.quantity + newSizeQty } : s
          )
        );
      else setSizes([...sizes, { size: newSize.trim(), quantity: newSizeQty }]);
      setNewSize('');
      setNewSizeQty(1);
    }
  };

  const removeSize = (size: string) => setSizes(sizes.filter((s) => s.size !== size));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null,
          sizes,
          hasCustomization,
        }),
      });

      if (res.ok) {
        setSuccess('Товар обновлён');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Ошибка');
      }
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Удалить товар "${product.name}"?`)) return;
    try {
      await fetch(`/api/products/${product.id}`, { method: 'DELETE' });
      router.push('/admin/products');
    } catch {
      setError('Ошибка при удалении');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="sm" className="border-white/10 text-gray-400">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Назад
          </Button>
        </Link>
      </div>

      <Card className="max-w-2xl border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">{product.name}</CardTitle>
          <p className="text-sm text-gray-500">Категория: {product.productcategory?.name || '—'}</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-400">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Фотографии</label>
              <div className="flex flex-wrap gap-3 mb-2">
                {form.images.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={img} alt="" className="h-20 w-20 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <ImageUpload
                value={form.images.length > 0 ? form.images[form.images.length - 1] : ''}
                onChange={(url) => {
                  if (url) addImage(url);
                }}
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">Название *</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border-white/10 bg-white/5 text-white"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Артикул</label>
              <Input
                value={form.article}
                onChange={(e) => setForm({ ...form, article: e.target.value })}
                className="border-white/10 bg-white/5 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Цена (BYN) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Акционная цена</label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.oldPrice}
                  onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400">Категория</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full border border-white/10 bg-white/5 p-2 text-sm text-white"
                required
              >
                <option value="">Выберите...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400">Описание</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-white/10 bg-white/5 p-3 text-sm text-white"
                rows={5}
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">Состав</label>
              <textarea
                value={form.composition}
                onChange={(e) => setForm({ ...form, composition: e.target.value })}
                className="w-full border border-white/10 bg-white/5 p-3 text-sm text-white"
                rows={3}
              />
            </div>

            {/* Размеры - обновлённая секция с редактируемым количеством */}
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Размеры и количество</label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  className="border-white/10 bg-white/5 text-white flex-1"
                  placeholder="Размер"
                />
                <Input
                  type="number"
                  value={newSizeQty}
                  onChange={(e) => setNewSizeQty(parseInt(e.target.value) || 1)}
                  className="border-white/10 bg-white/5 text-white w-20"
                  placeholder="Кол-во"
                />
                <Button
                  type="button"
                  onClick={addSize}
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-gray-400"
                >
                  <FontAwesomeIcon icon={faPlus} />
                </Button>
              </div>

              {sizes.map((s) => (
                <div
                  key={s.size}
                  className="flex items-center gap-4 border border-white/10 bg-white/5 px-3 py-2 mb-1"
                >
                  <span className="text-white text-sm font-bold w-12">{s.size}</span>

                  {/* Редактируемое количество */}
                  {editingSize === s.size ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        type="number"
                        min="0"
                        value={editingQuantity}
                        onChange={(e) => setEditingQuantity(parseInt(e.target.value) || 0)}
                        className="border-white/10 bg-white/10 text-white w-24 text-center"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={saveQuantityEdit}
                        className="text-green-400 text-sm px-2"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-red-400 text-sm px-2"
                      >
                        ✗
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-gray-400 text-sm flex-1">×{s.quantity} шт.</span>
                      <button
                        type="button"
                        onClick={() => startEditQuantity(s.size, s.quantity)}
                        className="text-[#ee862c] hover:text-[#f0ac74] transition-colors"
                        title="Редактировать количество"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => removeSize(s.size)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ))}

              {sizes.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4 border border-white/10 bg-white/5">
                  Нет добавленных размеров
                </p>
              )}
            </div>

            {/* Нанесение */}
            <div className="border-t border-white/10 pt-4">
              <label className="flex items-center gap-3 text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasCustomization}
                  onChange={(e) => setHasCustomization(e.target.checked)}
                  className="h-4 w-4 accent-[#ee862c]"
                />
                <span className="text-white font-medium">Доступно нанесение</span>
              </label>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                />{' '}
                В наличии
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                />{' '}
                На главную
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="bg-[#ee862c] hover:bg-[#f0ac74]">
                <FontAwesomeIcon icon={faSave} className="mr-2" /> Сохранить
              </Button>
              <Button variant="destructive" type="button" onClick={handleDelete}>
                <FontAwesomeIcon icon={faTrash} className="mr-2" /> Удалить
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
