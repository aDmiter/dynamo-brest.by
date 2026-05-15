// src/app/shop/checkout/success/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faEnvelope, faArrowRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const wsbTid = searchParams.get('wsb_tid');

  const [status, setStatus] = useState<'loading' | 'paid' | 'failed'>(
    !orderId ? 'failed' : wsbTid ? 'paid' : 'loading'
  );
  const [errorMessage, setErrorMessage] = useState(!orderId ? 'Номер заказа не найден' : '');
  const [attemptCount, setAttemptCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // При возврате с WebPay — обновляем статус заказа и списываем остатки
  useEffect(() => {
    if (!orderId || !wsbTid) return;

    const pendingOrderId = sessionStorage.getItem('pending_order_id');

    // Обновляем заказ через callback
    fetch(`/api/webpay/callback?wsb_order_num=${orderId}&wsb_tid=${wsbTid}`)
      .then((r) => r.json())
      .then((data) => {
        console.log('📡 Статус обновлён:', data);
        // Если есть pending_order_id — меняем статус на paid и списываем остатки
        if (pendingOrderId) {
          fetch(`/api/orders/${pendingOrderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'paid' }),
          }).then(() => {
            sessionStorage.removeItem('pending_order_id');
            // Удаляем корзину
            localStorage.removeItem('cart');
            window.dispatchEvent(new Event('cartUpdated'));
          });
        }
      })
      .catch((err) => console.error('❌ Ошибка:', err));
  }, [orderId, wsbTid]);

  // Проверяем статус если нет wsbTid
  useEffect(() => {
    if (!orderId || wsbTid) return;

    const maxAttempts = 10;
    let attempts = 0;

    const checkStatus = async () => {
      try {
        attempts++;
        setAttemptCount(attempts);

        const res = await fetch(`/api/webpay/status?orderNum=${orderId}`);

        if (res.ok) {
          const data = await res.json();
          if (data.isPaid) {
            setStatus('paid');
            const pendingOrderId = sessionStorage.getItem('pending_order_id');
            if (pendingOrderId) {
              await fetch(`/api/orders/${pendingOrderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'paid' }),
              });
              sessionStorage.removeItem('pending_order_id');
              localStorage.removeItem('cart');
              window.dispatchEvent(new Event('cartUpdated'));
            }
            return;
          }
        }

        if (attempts < maxAttempts) {
          timerRef.current = setTimeout(checkStatus, 3000);
        } else {
          setStatus('failed');
          setErrorMessage('Не удалось подтвердить оплату автоматически.');
        }
      } catch {
        if (attempts < maxAttempts) {
          timerRef.current = setTimeout(checkStatus, 3000);
        } else {
          setStatus('failed');
          setErrorMessage('Произошла ошибка при проверке статуса заказа.');
        }
      }
    };

    timerRef.current = setTimeout(checkStatus, 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [orderId, wsbTid]);

  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'var(--color-bg-main)', fontFamily: "'Inter Tight', sans-serif" }}
    >
      <div className="flex w-full flex-col items-center justify-center px-8 py-16 md:w-1/2 md:ml-20 md:pl-12 md:pr-16">
        {status === 'loading' ? (
          <>
            <div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center"
              style={{ background: 'var(--color-accent-10)', borderRadius: 16 }}
            >
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-4xl animate-spin"
                style={{ color: 'var(--color-accent)' }}
              />
            </div>
            <h1
              className="text-center text-2xl font-bold text-white"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
            >
              Проверяем статус оплаты...
            </h1>
            <p style={{ color: 'var(--color-text-stat)' }} className="mt-4">
              Обычно это занимает до 30 секунд
            </p>
            {orderId && (
              <p className="mt-2 text-sm" style={{ color: 'var(--color-text-label)' }}>
                Заказ №{orderId}
              </p>
            )}
            <div
              className="mt-6 flex items-center gap-2 text-sm"
              style={{ color: 'var(--color-text-stat)' }}
            >
              <span>Попытка {attemptCount} из 10</span>
            </div>
          </>
        ) : status === 'paid' ? (
          <>
            <div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.1)', borderRadius: 16 }}
            >
              <FontAwesomeIcon
                icon={faCheck}
                className="text-4xl"
                style={{ color: 'var(--color-win)' }}
              />
            </div>
            <h1
              className="text-center text-3xl font-bold text-white md:text-4xl"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
            >
              Заказ <span style={{ color: 'var(--color-accent)' }}>{orderId}</span> оплачен!
            </h1>
            <div className="mt-6 max-w-md text-center space-y-3">
              <div className="flex items-start gap-3 text-left">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="mt-1 flex-shrink-0"
                  style={{ color: 'var(--color-accent)' }}
                />
                <p className="text-sm" style={{ color: 'var(--color-text-stat)' }}>
                  Информация о заказе отправлена на вашу почту.
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="mt-10 inline-flex items-center gap-3 px-10 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors"
              style={{ background: 'var(--color-accent)', borderRadius: 10 }}
            >
              На главную <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </Link>
          </>
        ) : (
          <>
            <div
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 16 }}
            >
              <span className="text-4xl">❌</span>
            </div>
            <h1
              className="text-center text-2xl font-bold text-white"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
            >
              Оплата не подтверждена
            </h1>
            <p className="mt-4 max-w-md text-center" style={{ color: 'var(--color-text-stat)' }}>
              {errorMessage || 'Пожалуйста, попробуйте снова или свяжитесь с нами'}
            </p>
            <div className="mt-6 flex gap-4">
              <Link
                href="/shop/checkout"
                className="inline-flex items-center gap-3 px-10 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors"
                style={{ background: 'var(--color-accent)', borderRadius: 10 }}
              >
                Попробовать снова <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-3 px-10 py-4 text-sm font-bold uppercase tracking-wider transition-colors"
                style={{
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  borderRadius: 10,
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                На главную
              </Link>
            </div>
          </>
        )}
      </div>
      <div className="relative hidden h-screen w-[50vw] md:block">
        <img
          src="/images/cart-bg.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>
    </div>
  );
}
