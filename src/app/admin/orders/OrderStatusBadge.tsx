// src/app/admin/orders/OrderStatusBadge.tsx - Смена статуса заказа
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const statuses = [
  { value: 'paid', label: 'Оплачен', color: 'text-green-400 bg-green-400/10' },
  { value: 'unpaid', label: 'Не оплачен', color: 'text-yellow-400 bg-yellow-400/10' },
  { value: 'shipped', label: 'Отправлен', color: 'text-purple-400 bg-purple-400/10' },
  { value: 'delivered', label: 'Доставлен', color: 'text-blue-400 bg-blue-400/10' },
  { value: 'cancelled', label: 'Отменён', color: 'text-red-400 bg-red-400/10' },
];

interface OrderStatusBadgeProps {
  orderId: string;
  status: string;
}

export default function OrderStatusBadge({ orderId, status }: OrderStatusBadgeProps) {
  const [currentStatus, setCurrentStatus] = useState(status);
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

  const current = statuses.find((s) => s.value === currentStatus) || statuses[0];

  return (
    <select
      value={currentStatus}
      onChange={(e) => changeStatus(e.target.value)}
      disabled={loading}
      className={`text-xs px-2 py-1 cursor-pointer border-0 outline-none ${current.color}`}
    >
      {statuses.map((s) => (
        <option key={s.value} value={s.value} className="bg-[#1a1a2e] text-white">
          {s.label}
        </option>
      ))}
    </select>
  );
}
