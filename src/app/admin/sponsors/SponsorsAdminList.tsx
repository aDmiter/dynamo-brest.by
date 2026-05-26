'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import DeleteButton from '@/modules/admin/components/DeleteButton';
import ToggleButton from '@/modules/admin/components/ToggleButton';

export interface SponsorRow {
  id: string;
  name: string;
  imageUrl: string;
  type: string;
  order: number;
  isActive: boolean;
}

const TYPE_ORDER = ['league', 'general', 'government'] as const;

const typeLabels: Record<string, string> = {
  league: 'Лига',
  general: 'Общие',
  government: 'Государственные',
};

interface Props {
  initialSponsors: SponsorRow[];
}

function sortSponsors(list: SponsorRow[]): SponsorRow[] {
  const typeIndex = (t: string) => {
    const i = TYPE_ORDER.indexOf(t as (typeof TYPE_ORDER)[number]);
    return i === -1 ? TYPE_ORDER.length : i;
  };
  return [...list].sort((a, b) => typeIndex(a.type) - typeIndex(b.type) || a.order - b.order);
}

export default function SponsorsAdminList({ initialSponsors }: Props) {
  const [sponsors, setSponsors] = useState(() => sortSponsors(initialSponsors));
  const [savingOrder, setSavingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.destination.index === result.source.index) return;
    if (result.source.droppableId !== result.destination.droppableId) return;

    const type = result.source.droppableId;
    const previous = sponsors;
    const ofType = sponsors.filter((s) => s.type === type);
    const items = Array.from(ofType);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);

    const withNewOrder = items.map((s, i) => ({ ...s, order: i }));
    const orderById = new Map(withNewOrder.map((s) => [s.id, s.order]));
    const next = sortSponsors(
      sponsors.map((s) => (orderById.has(s.id) ? { ...s, order: orderById.get(s.id)! } : s)),
    );
    setSponsors(next);

    void (async () => {
      setSavingOrder(true);
      setOrderError(null);
      try {
        const payload = withNewOrder.map((s, i) => ({ id: s.id, order: i }));
        const res = await fetch('/api/sponsors/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: payload }),
        });
        if (!res.ok) {
          setSponsors(previous);
          setOrderError('Не удалось сохранить порядок');
        }
      } catch {
        setSponsors(previous);
        setOrderError('Ошибка соединения при сохранении порядка');
      } finally {
        setSavingOrder(false);
      }
    })();
  };

  if (sponsors.length === 0) {
    return (
      <div className="border border-white/10 bg-white/5 p-8 text-center text-gray-500 backdrop-blur-sm">
        Нет спонсоров
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orderError && (
        <p className="text-sm text-red-400" role="alert">
          {orderError}
        </p>
      )}
      <p className="text-sm text-gray-500">
        Перетащите строки внутри группы — порядок сохранится автоматически и отобразится на сайте.
        {savingOrder && <span className="ml-2 text-gray-400">Сохранение…</span>}
      </p>

      <DragDropContext onDragEnd={onDragEnd}>
        {TYPE_ORDER.map((type) => {
          const group = sponsors.filter((s) => s.type === type);
          if (group.length === 0) return null;

          return (
            <div
              key={type}
              className="border border-white/10 bg-white/5 backdrop-blur-sm overflow-x-auto"
            >
              <div className="border-b border-white/10 bg-white/5 px-3 py-2">
                <h2 className="text-sm font-semibold text-gray-300">{typeLabels[type]}</h2>
              </div>
              <table className="w-full min-w-[600px]">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr>
                    <th className="w-8 p-3 text-left text-sm text-gray-400" aria-label="Порядок" />
                    <th className="p-3 text-left text-sm text-gray-400">Лого</th>
                    <th className="p-3 text-left text-sm text-gray-400">Название</th>
                    <th className="p-3 text-center text-sm text-gray-400">Активен</th>
                    <th className="p-3 text-center text-sm text-gray-400">Действия</th>
                  </tr>
                </thead>
                <Droppable droppableId={type}>
                  {(provided) => (
                    <tbody ref={provided.innerRef} {...provided.droppableProps}>
                      {group.map((s, index) => (
                        <Draggable
                          key={s.id}
                          draggableId={s.id}
                          index={index}
                          isDragDisabled={savingOrder}
                        >
                          {(provided, snapshot) => (
                            <tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`border-b border-white/5 hover:bg-white/5 ${snapshot.isDragging ? 'bg-white/10' : ''}`}
                            >
                              <td className="p-3">
                                <span
                                  {...provided.dragHandleProps}
                                  className={`text-gray-500 hover:text-white ${savingOrder ? 'cursor-wait opacity-50' : 'cursor-grab'}`}
                                  title="Перетащить"
                                >
                                  <FontAwesomeIcon icon={faGripVertical} />
                                </span>
                              </td>
                              <td className="p-3">
                                <img
                                  src={s.imageUrl}
                                  alt={s.name}
                                  className="h-8 w-auto object-contain opacity-70"
                                />
                              </td>
                              <td className="p-3 text-white">{s.name}</td>
                              <td className="p-3 text-center">
                                <ToggleButton
                                  id={s.id}
                                  apiUrl="/api/sponsors"
                                  field="isActive"
                                  value={s.isActive}
                                  labelOn="Да"
                                  labelOff="Нет"
                                />
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-3">
                                  <Link
                                    href={`/admin/sponsors/${s.id}`}
                                    className="text-sm text-[#ee862c] hover:underline"
                                  >
                                    <FontAwesomeIcon icon={faEdit} /> Ред.
                                  </Link>
                                  <DeleteButton id={s.id} apiUrl="/api/sponsors" name={s.name} />
                                </div>
                              </td>
                            </tr>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </tbody>
                  )}
                </Droppable>
              </table>
            </div>
          );
        })}
      </DragDropContext>

      {sponsors.some((s) => !TYPE_ORDER.includes(s.type as (typeof TYPE_ORDER)[number])) && (
        <div className="border border-white/10 bg-white/5 backdrop-blur-sm overflow-x-auto">
          <div className="border-b border-white/10 bg-white/5 px-3 py-2">
            <h2 className="text-sm font-semibold text-gray-300">Прочие</h2>
          </div>
          <table className="w-full">
            <tbody>
              {sponsors
                .filter((s) => !TYPE_ORDER.includes(s.type as (typeof TYPE_ORDER)[number]))
                .map((s) => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3">
                      <img
                        src={s.imageUrl}
                        alt={s.name}
                        className="h-8 w-auto object-contain opacity-70"
                      />
                    </td>
                    <td className="p-3 text-white">{s.name}</td>
                    <td className="p-3 text-sm text-gray-400">{s.type}</td>
                    <td className="p-3 text-center">
                      <ToggleButton
                        id={s.id}
                        apiUrl="/api/sponsors"
                        field="isActive"
                        value={s.isActive}
                        labelOn="Да"
                        labelOff="Нет"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <Link
                        href={`/admin/sponsors/${s.id}`}
                        className="text-sm text-[#ee862c] hover:underline"
                      >
                        <FontAwesomeIcon icon={faEdit} /> Ред.
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
