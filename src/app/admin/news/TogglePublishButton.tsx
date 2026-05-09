// src/app/admin/news/TogglePublishButton.tsx - Быстрое переключение "Опубликовано"
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';

interface TogglePublishButtonProps {
  newsId: string;
  isPublished: boolean;
}

export default function TogglePublishButton({ newsId, isPublished }: TogglePublishButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/news/${newsId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !isPublished }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Server error:', errorData);
      }

      router.refresh();
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`transition-colors ${loading ? 'opacity-50' : ''}`}
      title={isPublished ? 'Скрыть' : 'Опубликовать'}
    >
      {isPublished ? (
        <span className="flex items-center justify-center gap-1 text-green-500 text-xs hover:text-green-400">
          <FontAwesomeIcon icon={faToggleOn} /> Опубл.
        </span>
      ) : (
        <span className="flex items-center justify-center gap-1 text-red-500 text-xs hover:text-red-400">
          <FontAwesomeIcon icon={faToggleOff} /> Скрыто
        </span>
      )}
    </button>
  );
}
