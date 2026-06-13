'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import DeleteButton from '@/modules/admin/components/DeleteButton';

export interface ProductAdminRow {
  id: string;
  name: string;
  article: string | null;
  price: string;
  images: string | null;
  isHit: boolean;
  isFeatured: boolean;
  sortOrder: number;
  productcategory?: { name: string } | null;
  manufacturer?: { name: string } | null;
}

const GROUPS = [
  { droppableId: 'hits', title: 'Хиты', isHit: true },
  { droppableId: 'regular', title: 'Каталог', isHit: false },
] as const;

function sortProducts(list: ProductAdminRow[]): ProductAdminRow[] {
  return [...list].sort((a, b) => {
    if (a.isHit !== b.isHit) return a.isHit ? -1 : 1;
    return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ru');
  });
}

interface Props {
  initialProducts: ProductAdminRow[];
}

export default function ProductsAdminList({ initialProducts }: Props) {
  const [products, setProducts] = useState(() => sortProducts(initialProducts));
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const groups = useMemo(
    () =>
      GROUPS.map((group) => ({
        ...group,
        items: products.filter((p) => p.isHit === group.isHit),
      })),
    [products]
  );

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    if (result.source.droppableId !== result.destination.droppableId) return;

    const groupIsHit = result.source.droppableId === 'hits';
    const previous = products;
    const groupItems = products.filter((p) => p.isHit === groupIsHit);
    const items = Array.from(groupItems);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    const withNewOrder = items.map((item, index) => ({ ...item, sortOrder: index }));
    const orderById = new Map(withNewOrder.map((item) => [item.id, item.sortOrder]));
    const next = sortProducts(
      products.map((p) =>
        orderById.has(p.id) ? { ...p, sortOrder: orderById.get(p.id)! } : p
      )
    );
    setProducts(next);

    setSavingOrder(true);
    setOrderError(null);
    try {
      const res = await fetch('/api/products/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: withNewOrder.map((item, index) => ({ id: item.id, sortOrder: index })),
        }),
      });
      if (!res.ok) {
        setProducts(previous);
        setOrderError('Не удалось сохранить порядок');
      }
    } catch {
      setProducts(previous);
      setOrderError('Ошибка соединения при сохранении порядка');
    } finally {
      setSavingOrder(false);
    }
  };

  if (products.length === 0) {
    return (
      <div className="border border-white/10 bg-white/5 p-8 text-center text-gray-500 backdrop-blur-sm">
        Нет товаров
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orderError ? (
        <p className="text-sm text-red-400" role="alert">
          {orderError}
        </p>
      ) : null}
      <p className="text-sm text-gray-500">
        Перетащите строки внутри группы — порядок сохранится и отобразится в каталоге. Хиты всегда
        выше остальных товаров.
        {savingOrder ? <span className="ml-2 text-gray-400">Сохранение…</span> : null}
      </p>

      <DragDropContext onDragEnd={onDragEnd}>
        {groups.map((group) => {
          if (group.items.length === 0) return null;

          return (
            <div
              key={group.droppableId}
              className="border border-white/10 bg-white/5 backdrop-blur-sm overflow-x-auto"
            >
              <div className="border-b border-white/10 bg-white/5 px-3 py-2">
                <h2 className="text-sm font-semibold text-gray-300">{group.title}</h2>
              </div>
              <table className="w-full min-w-[900px]">
                  <thead className="border-b border-white/10">
                    <tr>
                      <th className="w-10 p-3" aria-label="Порядок" />
                      <th className="p-3 text-left text-sm text-gray-400">Фото</th>
                      <th className="p-3 text-left text-sm text-gray-400">Название</th>
                      <th className="p-3 text-left text-sm text-gray-400">Артикул</th>
                      <th className="p-3 text-left text-sm text-gray-400">Цена</th>
                      <th className="p-3 text-left text-sm text-gray-400">Метки</th>
                      <th className="p-3 text-left text-sm text-gray-400">Категория</th>
                      <th className="p-3 text-left text-sm text-gray-400">Производитель</th>
                      <th className="p-3 text-center text-sm text-gray-400">Действия</th>
                    </tr>
                  </thead>
                  <Droppable droppableId={group.droppableId}>
                    {(provided) => (
                      <tbody ref={provided.innerRef} {...provided.droppableProps}>
                        {group.items.map((p, index) => {
                          const images: string[] = p.images ? JSON.parse(p.images) : [];
                          return (
                            <Draggable
                              key={p.id}
                              draggableId={p.id}
                              index={index}
                              isDragDisabled={savingOrder}
                            >
                              {(dragProvided, snapshot) => (
                                <tr
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  className={`border-b border-white/5 hover:bg-white/5 ${
                                    snapshot.isDragging ? 'bg-white/10' : ''
                                  }`}
                                >
                                  <td className="p-3 text-center text-gray-500">
                                    <span
                                      {...dragProvided.dragHandleProps}
                                      className="inline-flex cursor-grab active:cursor-grabbing"
                                      title="Перетащить"
                                    >
                                      <FontAwesomeIcon icon={faGripVertical} />
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    {images[0] ? (
                                      <img
                                        src={images[0]}
                                        alt=""
                                        className="h-10 w-10 object-cover"
                                      />
                                    ) : (
                                      <div className="h-10 w-10 bg-white/5" />
                                    )}
                                  </td>
                                  <td className="p-3 text-white">{p.name}</td>
                                  <td className="p-3 text-sm text-gray-400">{p.article || '—'}</td>
                                  <td className="p-3 text-sm text-white">
                                    {Number(p.price).toFixed(2)} BYN
                                  </td>
                                  <td className="p-3 text-sm">
                                    {p.isHit ? (
                                      <span className="mr-2 rounded border border-[#ee862c]/40 bg-[#ee862c]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#ee862c]">
                                        Хит
                                      </span>
                                    ) : null}
                                    {p.isFeatured ? (
                                      <span className="text-[10px] uppercase text-gray-500">
                                        главная
                                      </span>
                                    ) : null}
                                    {!p.isHit && !p.isFeatured ? (
                                      <span className="text-gray-600">—</span>
                                    ) : null}
                                  </td>
                                  <td className="p-3 text-sm text-gray-400">
                                    {p.productcategory?.name || '—'}
                                  </td>
                                  <td className="p-3 text-sm text-gray-500">
                                    {p.manufacturer?.name || '—'}
                                  </td>
                                  <td className="p-3 text-center">
                                    <div className="flex items-center justify-center gap-3">
                                      <Link
                                        href={`/admin/products/${p.id}`}
                                        className="text-sm text-[#ee862c] hover:underline"
                                      >
                                        <FontAwesomeIcon icon={faEdit} /> Ред.
                                      </Link>
                                      <DeleteButton id={p.id} apiUrl="/api/products" name={p.name} />
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </tbody>
                    )}
                  </Droppable>
              </table>
            </div>
          );
        })}
      </DragDropContext>
    </div>
  );
}
