// src/modules/admin/components/DeleteButton.tsx - Универсальная кнопка удаления
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

interface DeleteButtonProps {
  id: string;
  apiUrl: string; // например: '/api/news' или '/api/banners'
  name: string; // название для confirm
  onDeleted?: () => void;
}

export default function DeleteButton({ id, apiUrl, name, onDeleted }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Удалить "${name}"?`)) return;
    setLoading(true);
    try {
      await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
      if (onDeleted) onDeleted();
      else router.refresh();
    } catch (error) {
      console.error('Ошибка удаления:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="inline-flex items-center gap-1 text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
    >
      <FontAwesomeIcon icon={faTrash} className="text-xs" />
      {loading ? '...' : 'Уд.'}
    </button>
  );
}
