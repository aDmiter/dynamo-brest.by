// src/app/admin/news/ToggleFeaturedButton.tsx - Быстрое переключение "В слайдер"
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

interface ToggleFeaturedButtonProps {
  newsId: string;
  isFeatured: boolean;
}

export default function ToggleFeaturedButton({ newsId, isFeatured }: ToggleFeaturedButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggle = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/news/${newsId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !isFeatured }),
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
      title={isFeatured ? 'Убрать из слайдера' : 'В слайдер'}
    >
      <FontAwesomeIcon
        icon={faStar}
        className={isFeatured ? 'text-[#ee862c]' : 'text-gray-600 hover:text-[#ee862c]/60'}
      />
    </button>
  );
}
