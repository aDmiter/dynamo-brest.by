'use client';

import { useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripLines, faTimes, faUpload } from '@fortawesome/free-solid-svg-icons';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { Input } from '@/components/ui/input';

export type HistoryImageItem = {
  id: string;
  url: string;
  alt: string;
};

type Props = {
  images: HistoryImageItem[];
  onChange: (images: HistoryImageItem[]) => void;
};

function newImageId() {
  return `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ClubHistoryImagesEditor({ images, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'admin');
      formData.append('storage', 'club-history');

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        onChange([...images, { id: newImageId(), url: data.url, alt: '' }]);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const list = Array.from(images);
    const [moved] = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, moved);
    onChange(list);
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const updateAlt = (index: number, alt: string) => {
    onChange(images.map((img, i) => (i === index ? { ...img, alt } : img)));
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Первая картинка — превью в хронологии. Остальные отображаются галереей под текстом в
        модальном окне.
      </p>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="club-history-images">
          {(provided) => (
            <ul
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2"
            >
              {images.map((img, index) => (
                <Draggable key={img.id} draggableId={img.id} index={index}>
                  {(dragProvided) => (
                    <li
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className="flex gap-3 border border-white/10 bg-[#1a1f2e] p-3"
                    >
                      <span
                        {...dragProvided.dragHandleProps}
                        className="cursor-grab self-center text-gray-500"
                      >
                        <FontAwesomeIcon icon={faGripLines} />
                      </span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt=""
                        className="h-20 w-28 shrink-0 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1 space-y-2">
                        <p className="text-xs text-gray-500">
                          {index === 0 ? 'Заглавная (превью)' : `Галерея #${index}`}
                        </p>
                        <Input
                          value={img.alt}
                          onChange={(e) => updateAlt(index, e.target.value)}
                          placeholder="Подпись (alt)"
                          className="border-white/10 bg-white/5 text-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAt(index)}
                        className="self-start text-gray-400 hover:text-red-400"
                        aria-label="Удалить"
                      >
                        <FontAwesomeIcon icon={faTimes} />
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

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="inline-flex items-center gap-2 border border-white/20 px-4 py-2 text-sm text-gray-300 hover:border-[#ee862c] hover:text-[#ee862c] disabled:opacity-50"
      >
        <FontAwesomeIcon icon={faUpload} />
        {uploading ? 'Загрузка…' : 'Загрузить картинку'}
      </button>
    </div>
  );
}
