// src/modules/admin/components/ToggleButton.tsx - Универсальная кнопка переключения
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';

interface ToggleButtonProps {
  id: string;
  apiUrl: string;
  field: string;
  value: boolean;
  iconOn?: IconDefinition;
  iconOff?: IconDefinition;
  labelOn?: string;
  labelOff?: string;
  className?: string;
}

export default function ToggleButton({
  id,
  apiUrl,
  field,
  value,
  iconOn = faToggleOn,
  iconOff = faToggleOff,
  labelOn = '',
  labelOff = '',
  className = '',
}: ToggleButtonProps) {
  const [loading, setLoading] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const router = useRouter();

  const toggle = async () => {
    setLoading(true);
    const newValue = !currentValue;
    try {
      const res = await fetch(`${apiUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: newValue }),
      });
      if (res.ok) {
        setCurrentValue(newValue);
        router.refresh();
      }
    } catch (error) {
      console.error('Ошибка переключения:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`transition-colors cursor-pointer ${loading ? 'opacity-50' : ''} ${className}`}
      title={currentValue ? 'Выключить' : 'Включить'}
    >
      {currentValue ? (
        <span className="flex items-center justify-center text-green-500 text-lg hover:text-green-400">
          <FontAwesomeIcon icon={iconOn} />
          {labelOn && <span className="ml-1 text-xs">{labelOn}</span>}
        </span>
      ) : (
        <span className="flex items-center justify-center text-red-500 text-lg hover:text-red-400">
          <FontAwesomeIcon icon={iconOff} />
          {labelOff && <span className="ml-1 text-xs">{labelOff}</span>}
        </span>
      )}
    </button>
  );
}
