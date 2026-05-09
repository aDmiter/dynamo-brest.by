// src/app/admin/news/DeleteNewsButton.tsx - Кнопка удаления новости
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

interface DeleteNewsButtonProps {
  newsId: string;
  newsTitle: string;
}

export default function DeleteNewsButton({ newsId, newsTitle }: DeleteNewsButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Удалить новость "${newsTitle}"?`)) return;

    setLoading(true);
    try {
      await fetch(`/api/news/${newsId}`, { method: 'DELETE' });
      router.refresh();
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
