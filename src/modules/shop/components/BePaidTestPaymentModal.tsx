'use client';

import { useState } from 'react';
import type { BePaidWidgetCloseStatus } from '@/types/bepaid-widget';

type Props = {
  orderNumber: string;
  total: number;
  token: string;
  onClose: (status: BePaidWidgetCloseStatus) => void;
};

export function BePaidTestPaymentModal({ orderNumber, total, token, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const complete = async (success: boolean) => {
    setLoading(true);
    try {
      const res = await fetch('/api/bepaid/mock/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, success }),
      });
      if (!res.ok) {
        onClose('error');
        return;
      }
      onClose(success ? 'successful' : 'failed');
    } catch {
      onClose('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bepaid-test-title"
    >
      <div
        className="w-full max-w-md p-6 text-white"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          fontFamily: "'Inter Tight', sans-serif",
        }}
      >
        <p
          id="bepaid-test-title"
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: 'var(--color-accent)' }}
        >
          Тестовая оплата bePaid
        </p>
        <h2 className="mt-2 text-xl font-bold">Заказ {orderNumber}</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-stat)' }}>
          Сумма: {total.toFixed(2)} BYN · ключи магазина не подключены
        </p>
        <p className="mt-4 text-sm" style={{ color: 'var(--color-text-stat)' }}>
          Имитация виджета. После договора с bePaid подставьте{' '}
          <code className="text-white">BEPAID_SHOP_ID</code> и{' '}
          <code className="text-white">BEPAID_SECRET_KEY</code>, карты из{' '}
          <a
            href="https://docs.bepaid.by/ru/integration/card_api/testing/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: 'var(--color-accent)' }}
          >
            документации
          </a>
          .
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => complete(true)}
            className="w-full py-3 text-sm font-bold uppercase disabled:opacity-50"
            style={{ background: 'var(--color-win)', borderRadius: 8, color: '#fff' }}
          >
            Успех (как 4200000000000000)
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => complete(false)}
            className="w-full py-3 text-sm font-bold uppercase disabled:opacity-50"
            style={{
              background: 'rgba(239,68,68,0.2)',
              border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: 8,
              color: 'var(--color-loss)',
            }}
          >
            Отказ (как 4005550000000019)
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => onClose(null)}
            className="w-full py-2 text-sm"
            style={{ color: 'var(--color-text-stat)' }}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
