'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ORDER_STATUS_OPTIONS, normalizeOrderStatus } from '@/lib/order-status';

interface OrderStatusBadgeProps {
  orderId: string;
  status: string;
}

export default function OrderStatusBadge({ orderId, status }: OrderStatusBadgeProps) {
  const [currentStatus, setCurrentStatus] = useState(() => normalizeOrderStatus(status));
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const changeStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setCurrentStatus(newStatus);
      router.refresh();
    } catch (error) {
      console.error('Ошибка смены статуса:', error);
    } finally {
      setLoading(false);
    }
  };

  const current =
    ORDER_STATUS_OPTIONS.find((s) => s.value === currentStatus) ?? ORDER_STATUS_OPTIONS[0];

  return (
    <select
      value={currentStatus}
      onChange={(e) => changeStatus(e.target.value)}
      disabled={loading}
      className={`cursor-pointer border-0 px-2 py-1 text-xs outline-none ${current.color}`}
    >
      {ORDER_STATUS_OPTIONS.map((s) => (
        <option key={s.value} value={s.value} className="bg-[#1a1a2e] text-white">
          {s.label}
        </option>
      ))}
    </select>
  );
}
