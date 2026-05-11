// src/app/admin/orders/[id]/TrackingCodeInput.tsx - Ввод трекинг-кода
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faCheck } from '@fortawesome/free-solid-svg-icons';

interface TrackingCodeInputProps {
  orderId: string;
  trackingCode: string;
}

export default function TrackingCodeInput({ orderId, trackingCode }: TrackingCodeInputProps) {
  const [code, setCode] = useState(trackingCode);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingCode: code }),
      });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-2 mt-1">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Введите код..."
        className="flex-1 border border-white/10 bg-white/5 p-2 text-sm text-white outline-none focus:border-[#ee862c]"
      />
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-1 bg-[#ee862c] px-3 py-2 text-xs font-bold text-white hover:bg-[#f0ac74] transition-colors disabled:opacity-50"
      >
        <FontAwesomeIcon icon={saved ? faCheck : faSave} />
        {saving ? '...' : ''}
      </button>
    </div>
  );
}
