// src/app/admin/products/new/page.tsx - Добавление товара
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import ImageUpload from '@/modules/admin/components/ImageUpload';
import { transliterate } from '@/lib/utils';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const [form, setForm] = useState({
    name: '',
    article: '',
    description: '',
    composition: '',
    price: '',
    oldPrice: '',
    categoryId: '',
    images: [] as string[],
    inStock: true,
    isFeatured: false,
    useSizes: false,
    quantity: 0,
  });

  const [sizes, setSizes] = useState<{ size: string; quantity: number }[]>([]);
  const [newSize, setNewSize] = useState('');
  const [newSizeQty, setNewSizeQty] = useState(1);
  const [hasCustomization, setHasCustomization] = useState(false);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  const addImage = (url: string) => setForm({ ...form, images: [...form.images, url] });
  const removeImage = (index: number) =>
    setForm({ ...form, images: form.images.filter((_, i) => i !== index) });

  const addSize = () => {
    if (newSize.trim() && newSizeQty > 0) {
      const existing = sizes.find((s) => s.size === newSize.trim());
      if (existing) {
        setSizes(
          sizes.map((s) =>
            s.size === newSize.trim() ? { ...s, quantity: s.quantity + newSizeQty } : s
          )
        );
      } else {
        setSizes([...sizes, { size: newSize.trim(), quantity: newSizeQty }]);
      }
      setNewSize('');
      setNewSizeQty(1);
    }
  };

  const removeSize = (size: string) => setSizes(sizes.filter((s) => s.size !== size));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.name || !form.price || !form.categoryId) {
      setError('Название, цена и категория обязательны');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          slug: transliterate(form.name),
          price: parseFloat(form.price),
          oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null,
          sizes: form.useSizes ? sizes : [],
          hasCustomization,
          quantity: form.useSizes ? 0 : form.quantity,
        }),
      });
      if (res.ok) {
        router.push('/admin/products');
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

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/products">
          <Button variant="outline" size="sm" className="border-white/10 text-gray-400">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Назад
          </Button>
        </Link>
        <h1 className="font-heading text-2xl font-bold text-white">Добавить товар</h1>
      </div>
      <Card className="max-w-2xl border-white/10 bg-white/5 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">Новый товар</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
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
                      onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center"
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
              <label className="text-sm text-gray-400">Категория *</label>
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

            {/* Чекбокс "Добавить размеры" */}
            <div className="border-t border-white/10 pt-4">
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.useSizes}
                  onChange={(e) => setForm({ ...form, useSizes: e.target.checked })}
                  className="h-4 w-4 accent-[#ee862c]"
                />
                <span className="text-white font-medium">Добавить размеры</span>
              </label>
            </div>

            {/* Размеры (если чекбокс выбран) */}
            {form.useSizes ? (
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Размеры и количество</label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                    className="border-white/10 bg-white/5 text-white flex-1"
                    placeholder="Размер (S, M, L...)"
                  />
                  <Input
                    type="number"
                    value={newSizeQty}
                    onChange={(e) => setNewSizeQty(parseInt(e.target.value) || 1)}
                    className="border-white/10 bg-white/5 text-white w-20"
                    placeholder="Кол-во"
                    min="1"
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
                {sizes.length > 0 && (
                  <div className="space-y-2">
                    {sizes.map((s) => (
                      <div
                        key={s.size}
                        className="flex items-center gap-4 border border-white/10 bg-white/5 px-3 py-2"
                      >
                        <span className="text-white text-sm font-bold w-10">{s.size}</span>
                        <span className="text-gray-400 text-sm">×{s.quantity} шт.</span>
                        <button
                          type="button"
                          onClick={() => removeSize(s.size)}
                          className="ml-auto text-red-400 hover:text-red-300"
                        >
                          <FontAwesomeIcon icon={faTimes} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {sizes.length === 0 && (
                  <p className="text-xs text-gray-600">Добавьте хотя бы один размер</p>
                )}
              </div>
            ) : (
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Количество на складе</label>
                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                  className="border-white/10 bg-white/5 text-white w-32"
                  min="0"
                />
              </div>
            )}

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

            <Button type="submit" disabled={loading} className="bg-[#ee862c] hover:bg-[#f0ac74]">
              <FontAwesomeIcon icon={faSave} className="mr-2" />
              Сохранить
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
