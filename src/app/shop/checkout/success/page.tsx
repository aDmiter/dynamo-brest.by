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

  // Если есть wsb_tid — значит вернулись с WebPay, сразу показываем успех
  const [status, setStatus] = useState<'loading' | 'paid' | 'failed'>(
    !orderId ? 'failed' : wsbTid ? 'paid' : 'loading'
  );
  const [errorMessage, setErrorMessage] = useState(!orderId ? 'Номер заказа не найден' : '');
  const [attemptCount, setAttemptCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // При возврате с WebPay — обновляем статус заказа
  useEffect(() => {
    if (!orderId || !wsbTid) return;

    console.log('📡 Возврат с WebPay, обновляем статус заказа...');

    // Обновляем заказ через API
    fetch(`/api/webpay/callback?wsb_order_num=${orderId}&wsb_tid=${wsbTid}`)
      .then((r) => r.json())
      .then((data) => console.log('📡 Статус обновлён:', data))
      .catch((err) => console.error('❌ Ошибка:', err));
  }, [orderId, wsbTid]);

  // Проверяем статус только если нет wsbTid (не вернулись с WebPay)
  useEffect(() => {
    if (!orderId || wsbTid) return;

    const maxAttempts = 10;
    let attempts = 0;

    const checkStatus = async () => {
      try {
        attempts++;
        setAttemptCount(attempts);
        console.log(`📡 Проверка статуса заказа ${orderId} (попытка ${attempts}/${maxAttempts})`);

        const res = await fetch(`/api/webpay/status?orderNum=${orderId}`);

        if (res.ok) {
          const data = await res.json();
          if (data.isPaid) {
            setStatus('paid');
            return;
          }
        }

        if (attempts < maxAttempts) {
          timerRef.current = setTimeout(checkStatus, 3000);
        } else {
          setStatus('failed');
          setErrorMessage(
            'Не удалось подтвердить оплату автоматически. Если вы уверены что оплата прошла, свяжитесь с нами.'
          );
        }
      } catch (err) {
        console.error('❌ Ошибка при проверке статуса:', err);
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
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [orderId, wsbTid]);

  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex w-full flex-col items-center justify-center px-8 py-16 md:w-1/2 md:ml-20 md:pl-12 md:pr-16">
        {status === 'loading' ? (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center bg-[#ee862c]/10">
              <FontAwesomeIcon icon={faSpinner} className="text-4xl text-[#ee862c] animate-spin" />
            </div>
            <h1
              className="text-center font-heading text-2xl font-bold text-[#242C41]"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
            >
              Проверяем статус оплаты...
            </h1>
            <p className="mt-4 text-gray-500">Обычно это занимает до 30 секунд</p>
            {orderId && <p className="mt-2 text-sm text-gray-400">Заказ №{orderId}</p>}
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
              <span>Попытка {attemptCount} из 10</span>
            </div>
          </>
        ) : status === 'paid' ? (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center bg-green-100">
              <FontAwesomeIcon icon={faCheck} className="text-4xl text-green-600" />
            </div>
            <h1
              className="text-center font-heading text-3xl font-bold text-[#242C41] md:text-4xl"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
            >
              Заказ <span className="text-[#ee862c]">{orderId}</span> оплачен!
            </h1>
            <div className="mt-6 max-w-md text-center space-y-3">
              <div className="flex items-start gap-3 text-left">
                <FontAwesomeIcon icon={faEnvelope} className="text-[#ee862c] mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-500">
                  Информация о заказе отправлена на вашу почту.
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="mt-10 inline-flex items-center gap-3 bg-[#ee862c] px-10 py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#f0ac74] transition-colors"
            >
              На главную <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center bg-red-100">
              <span className="text-4xl">❌</span>
            </div>
            <h1
              className="text-center font-heading text-2xl font-bold text-[#242C41]"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
            >
              Оплата не подтверждена
            </h1>
            <p className="mt-4 text-gray-500 max-w-md text-center">
              {errorMessage || 'Пожалуйста, попробуйте снова или свяжитесь с нами'}
            </p>
            <div className="mt-6 flex gap-4">
              <Link
                href="/shop/checkout"
                className="inline-flex items-center gap-3 bg-[#ee862c] px-10 py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#f0ac74] transition-colors"
              >
                Попробовать снова <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-3 border border-gray-300 px-10 py-4 text-sm font-bold uppercase tracking-wider text-[#242C41] hover:border-[#242C41] transition-colors"
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
