// src/modules/admin/components/ImageUpload.tsx - Загрузка изображений
'use client';

import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTimes } from '@fortawesome/free-solid-svg-icons';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string; // 'news', 'logos', 'products'
}

export default function ImageUpload({ value, onChange, folder = 'news' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder); // передаём папку

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {value ? (
        <div className="relative inline-block">
          <img src={value} alt="Preview" className="mb-3 max-h-40 object-contain" />
          <button
            onClick={() => onChange('')}
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center bg-red-500 text-white text-xs hover:bg-red-600"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      ) : (
        <img
          src="/images/placeholder.jpg"
          alt="Placeholder"
          className="mb-3 max-h-40 object-contain opacity-50"
        />
      )}

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 border border-white/20 px-4 py-2 text-sm text-gray-400 transition-colors hover:border-[#ee862c] hover:text-[#ee862c] disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faUpload} />
          {uploading ? 'Загрузка...' : value ? 'Заменить картинку' : 'Загрузить картинку'}
        </button>
      </div>
    </div>
  );
}
