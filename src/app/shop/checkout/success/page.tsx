// src/app/shop/checkout/success/page.tsx - Страница успешной оплаты
'use client';

import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faEnvelope, faArrowRight, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [status, setStatus] = useState<'loading' | 'paid' | 'failed'>('loading');

  useEffect(() => {
    if (!orderId) return;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/webpay/status?orderNum=${orderId}`);
        const data = await res.json();

        if (data.transaction?.status === 'Authorized' || data.transaction?.status === 'Completed') {
          setStatus('paid');
        } else {
          // Повторная проверка через 3 секунды
          setTimeout(checkStatus, 3000);
        }
      } catch {
        setTimeout(checkStatus, 3000);
      }
    };

    checkStatus();
  }, [orderId]);

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
            <p className="mt-4 text-gray-500">Пожалуйста, подождите</p>
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
              Оплата не прошла
            </h1>
            <p className="mt-4 text-gray-500">Пожалуйста, попробуйте снова или свяжитесь с нами</p>
            <Link
              href="/shop/checkout"
              className="mt-8 inline-flex items-center gap-3 bg-[#ee862c] px-10 py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#f0ac74] transition-colors"
            >
              Попробовать снова <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </Link>
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
