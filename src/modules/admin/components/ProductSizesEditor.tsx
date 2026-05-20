'use client';

import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type AdminProductSizeRow = { size: string; quantity: number };

interface ProductSizesEditorProps {
  sizes: AdminProductSizeRow[];
  onSizesChange: (sizes: AdminProductSizeRow[]) => void;
  /** Уникальный id для DnD (если на странице несколько редакторов) */
  droppableId?: string;
}

export default function ProductSizesEditor({
  sizes,
  onSizesChange,
  droppableId = 'product-sizes',
}: ProductSizesEditorProps) {
  const [newSize, setNewSize] = useState('');
  const [newSizeQty, setNewSizeQty] = useState(1);

  const addSize = () => {
    if (!newSize.trim() || newSizeQty < 0) return;
    const key = newSize.trim();
    const existing = sizes.find((s) => s.size === key);
    if (existing) {
      onSizesChange(
        sizes.map((s) => (s.size === key ? { ...s, quantity: s.quantity + newSizeQty } : s))
      );
    } else {
      onSizesChange([...sizes, { size: key, quantity: newSizeQty }]);
    }
    setNewSize('');
    setNewSizeQty(1);
  };

  const removeSize = (size: string) => onSizesChange(sizes.filter((s) => s.size !== size));

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;
    const next = Array.from(sizes);
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onSizesChange(next);
  };

  return (
    <div>
      <label className="text-sm text-gray-400 mb-2 block">Размеры и количество</label>
      <p className="text-xs text-gray-500 mb-2">
        Перетащите строку за иконку ⋮⋮, чтобы изменить порядок вывода размеров в магазине.
      </p>
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
          onChange={(e) => setNewSizeQty(Math.max(0, parseInt(e.target.value, 10) || 0))}
          className="border-white/10 bg-white/5 text-white w-20"
          placeholder="Кол-во"
          min={0}
        />
        <Button
          type="button"
          onClick={addSize}
          size="sm"
          variant="outline"
          className="border-white/10 text-gray-400 shrink-0"
        >
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={droppableId}>
          {(dropProvided) => (
            <div ref={dropProvided.innerRef} {...dropProvided.droppableProps} className="space-y-1">
              {sizes.map((s, index) => (
                <Draggable key={s.size} draggableId={`size-${droppableId}-${s.size}`} index={index}>
                  {(dragProvided, snapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className={`flex flex-wrap items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 ${
                        snapshot.isDragging ? 'ring-1 ring-[#ee862c]/50' : ''
                      }`}
                    >
                      <button
                        type="button"
                        className="cursor-grab text-gray-500 hover:text-gray-300 active:cursor-grabbing p-1 shrink-0 touch-none"
                        {...dragProvided.dragHandleProps}
                        aria-label="Перетащить"
                      >
                        <FontAwesomeIcon icon={faGripVertical} />
                      </button>
                      <span className="text-white text-sm font-bold w-10 shrink-0">{s.size}</span>
                      <span className="text-gray-400 text-sm shrink-0">×</span>
                      <Input
                        type="number"
                        min={0}
                        value={s.quantity}
                        onChange={(e) => {
                          const v = Math.max(0, parseInt(e.target.value, 10) || 0);
                          onSizesChange(sizes.map((x) => (x.size === s.size ? { ...x, quantity: v } : x)));
                        }}
                        className="h-8 w-20 border-white/10 bg-white/5 text-white text-sm"
                      />
                      <span className="text-gray-400 text-sm shrink-0">шт.</span>
                      <button
                        type="button"
                        onClick={() => removeSize(s.size)}
                        className="ml-auto text-red-400 hover:text-red-300 shrink-0"
                        title="Удалить размер"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {dropProvided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {sizes.length === 0 && (
        <p className="text-xs text-gray-600 mt-2">Добавьте хотя бы один размер</p>
      )}
    </div>
  );
}
