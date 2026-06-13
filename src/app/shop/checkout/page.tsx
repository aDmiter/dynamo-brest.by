// src/app/shop/checkout/page.tsx — оформление заказа (bePaid виджет или WebPay)
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faArrowRight,
  faArrowLeft,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { BePaidWidget, type BePaidWidgetHandle } from '@/modules/shop/components/BePaidWidget';
import type { BePaidWidgetCloseStatus } from '@/types/bepaid-widget';
import { UNPAID_ORDER_PAYMENT_TTL_MINUTES } from '@/config/shop-order-payment';

const USE_WEBPAY = process.env.NEXT_PUBLIC_SHOP_PAYMENT_PROVIDER === 'webpay';

interface PaymentStatusResponse {
  status: string;
  expired: boolean;
  cancelled: boolean;
  expiresAt: string;
  remainingSeconds: number;
  orderNumber?: string;
}

function formatPaymentCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function clearCheckoutSession() {
  sessionStorage.removeItem('pending_order_id');
  sessionStorage.removeItem('bepaid_payment_token');
  sessionStorage.removeItem('webpay_params');
  localStorage.removeItem('cart');
  window.dispatchEvent(new Event('cartUpdated'));
}

interface CartItem {
  cartKey: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
  size?: string;
  customization?: Record<string, unknown> | null;
}

interface Country {
  id: string;
  name: string;
  code: string;
  price: string | null;
  isActive: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cancelled = searchParams.get('cancelled');

  const bePaidRef = useRef<BePaidWidgetHandle>(null);
  const pendingOrderRef = useRef<{ id: string; orderNumber: string } | null>(null);
  const paymentTokenRef = useRef<string | null>(null);
  const paymentExpiresAtRef = useRef<string | null>(null);

  const [cart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('cart') || '[]');
      } catch {
        return [];
      }
    }
    return [];
  });

  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState('');
  const [paymentMock, setPaymentMock] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [paymentRemainingSeconds, setPaymentRemainingSeconds] = useState<number | null>(null);

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    address: '',
    countryId: '',
    comment: '',
  });

  useEffect(() => {
    fetch('/api/countries')
      .then((r) => r.json())
      .then((data) => setCountries(data.filter((c: Country) => c.isActive)))
      .catch(console.error);

    if (!USE_WEBPAY) {
      fetch('/api/bepaid/config')
        .then((r) => r.json())
        .then((data) => setPaymentMock(Boolean(data.mock)))
        .catch(() => {});
    }
  }, []);

  const handleOrderExpired = useCallback(() => {
    clearCheckoutSession();
    pendingOrderRef.current = null;
    paymentTokenRef.current = null;
    paymentExpiresAtRef.current = null;
    setPendingOrderId(null);
    setPaymentRemainingSeconds(null);
    setProcessingPayment(false);
    router.replace('/shop/cart?expired=1');
  }, [router]);

  const syncPaymentStatus = useCallback(
    async (orderId: string): Promise<PaymentStatusResponse | null> => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/payment-status`);
        if (!res.ok) return null;
        const data = (await res.json()) as PaymentStatusResponse;

        if (data.expired || data.cancelled || data.status === 'cancelled') {
          handleOrderExpired();
          return data;
        }

        if (data.orderNumber) {
          pendingOrderRef.current = { id: orderId, orderNumber: data.orderNumber };
        }

        paymentExpiresAtRef.current = data.expiresAt;
        setPendingOrderId(orderId);
        setPaymentRemainingSeconds(data.remainingSeconds);
        return data;
      } catch {
        return null;
      }
    },
    [handleOrderExpired]
  );

  useEffect(() => {
    const storedOrderId = sessionStorage.getItem('pending_order_id');
    if (!storedOrderId) return;

    let cancelled = false;

    fetch(`/api/orders/${encodeURIComponent(storedOrderId)}/payment-status`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PaymentStatusResponse | null) => {
        if (cancelled || !data) return;

        if (data.expired || data.cancelled || data.status === 'cancelled') {
          handleOrderExpired();
          return;
        }

        if (data.orderNumber) {
          pendingOrderRef.current = { id: storedOrderId, orderNumber: data.orderNumber };
        }

        paymentExpiresAtRef.current = data.expiresAt;
        setPendingOrderId(storedOrderId);
        setPaymentRemainingSeconds(data.remainingSeconds);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [handleOrderExpired]);

  useEffect(() => {
    if (!pendingOrderId) return;

    const tick = () => {
      const expiresAt = paymentExpiresAtRef.current;
      if (!expiresAt) return;

      const remaining = Math.max(
        0,
        Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000)
      );
      setPaymentRemainingSeconds(remaining);

      if (remaining <= 0) {
        void syncPaymentStatus(pendingOrderId);
      }
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [pendingOrderId, syncPaymentStatus]);

  useEffect(() => {
    const orderId = pendingOrderId || sessionStorage.getItem('pending_order_id');
    if (!orderId) return;

    const poll = window.setInterval(() => {
      void syncPaymentStatus(orderId);
    }, 30000);

    return () => window.clearInterval(poll);
  }, [pendingOrderId, syncPaymentStatus]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedCountry = countries.find((c) => c.id === form.countryId);
  const deliveryPrice = selectedCountry?.price ? Number(selectedCountry.price) : 0;
  const total = subtotal + deliveryPrice;

  const goToSuccess = useCallback(
    (orderNumber: string) => {
      const clean = orderNumber.replace(/^#/, '');
      const token = paymentTokenRef.current;
      const params = new URLSearchParams({ orderId: clean, status: 'successful' });
      if (token) params.set('token', token);
      router.push(`/shop/checkout/success?${params.toString()}`);
    },
    [router]
  );

  const submitToWebPay = (params: Record<string, string>) => {
    try {
      sessionStorage.setItem('webpay_params', JSON.stringify(params));
    } catch {}

    const formElement = document.createElement('form');
    formElement.method = 'POST';
    formElement.action =
      process.env.NEXT_PUBLIC_WEBPAY_URL || 'https://securesandbox.webpay.by';
    formElement.style.display = 'none';
    formElement.acceptCharset = 'UTF-8';

    Object.entries(params).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = String(value);
      formElement.appendChild(input);
    });

    document.body.appendChild(formElement);
    formElement.submit();
  };

  const handleBePaidClose = useCallback(
    (status: BePaidWidgetCloseStatus) => {
      setProcessingPayment(false);

      if (status === 'successful') {
        const pending = pendingOrderRef.current;
        if (pending) {
          goToSuccess(pending.orderNumber);
        }
        return;
      }

      if (status === 'pending' || status === 'redirected') {
        setError('Платёж обрабатывается. Дождитесь подтверждения банка или попробуйте снова.');
        return;
      }

      if (status === 'failed' || status === 'error' || status === null) {
        setError('Платёж не был завершён. Попробуйте снова.');
      }
    },
    [goToSuccess]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: '',
          address: form.address,
          deliveryCountryId: form.countryId || null,
          deliveryCountryName: selectedCountry?.name || null,
          comment: form.comment,
          deliveryPrice,
          items: cart.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            size: item.size || null,
            customization: item.customization || null,
          })),
          total,
          status: 'unpaid',
        }),
      });

      const orderData = await res.json();

      if (!res.ok) {
        if (res.status === 409 && Array.isArray(orderData.issues)) {
          const details = orderData.issues
            .map(
              (i: { productName: string; size: string | null; available: number }) =>
                `${i.productName}${i.size ? ` (${i.size})` : ''}: осталось ${i.available} шт.`
            )
            .join('. ');
          setError(
            details
              ? `${orderData.error || 'Недостаточно товара на складе'}. ${details}`
              : orderData.error || 'Недостаточно товара на складе'
          );
        } else {
          setError(orderData.error || 'Ошибка при создании заказа');
        }
        return;
      }

      const orderNumber = orderData.orderNumber || orderData.id;
      pendingOrderRef.current = { id: orderData.id, orderNumber };
      sessionStorage.setItem('pending_order_id', orderData.id);
      setPendingOrderId(orderData.id);
      await syncPaymentStatus(orderData.id);

      const cartItems = cart.map((item) => ({
        name: item.productName + (item.size ? ` (${item.size})` : ''),
        quantity: item.quantity,
        price: item.price,
      }));

      if (USE_WEBPAY) {
        const signRes = await fetch('/api/webpay/create-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderNumber,
            items: cartItems,
            total,
            deliveryPrice: deliveryPrice > 0 ? deliveryPrice : undefined,
            customerEmail: form.customerEmail,
            customerName: form.customerName,
            customerAddress: form.address,
          }),
        });

        const signData = await signRes.json();

        if (signData.success) {
          setProcessingPayment(true);
          submitToWebPay(signData.params);
        } else {
          if (signRes.status === 410) {
            handleOrderExpired();
            return;
          }
          setError(signData.error || 'Не удалось создать платёж');
        }
        return;
      }

      const checkoutRes = await fetch('/api/bepaid/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderNumber,
          total,
          customerEmail: form.customerEmail,
          customerName: form.customerName,
          customerAddress: form.address,
        }),
      });

      const checkoutData = await checkoutRes.json();

      if (!checkoutRes.ok || !checkoutData.token) {
        if (checkoutRes.status === 410) {
          handleOrderExpired();
          return;
        }
        setError(checkoutData.error || 'Не удалось открыть оплату');
        return;
      }

      paymentTokenRef.current = checkoutData.token;
      sessionStorage.setItem('bepaid_payment_token', checkoutData.token);
      if (checkoutData.mock) setPaymentMock(true);
      setProcessingPayment(true);
      bePaidRef.current?.open(checkoutData.token, {
        orderNumber,
        total,
      });
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  const payButtonLabel = USE_WEBPAY ? 'Оплатить через WebPay' : 'Оплатить картой';

  if (cart.length === 0) {
    return (
      <EmptyCart />
    );
  }

  return (
    <div
      className="checkout-page flex min-h-screen"
      style={{ background: 'var(--color-bg-main)', fontFamily: "'Inter Tight', sans-serif" }}
    >
      {!USE_WEBPAY && <BePaidWidget ref={bePaidRef} onClose={handleBePaidClose} />}

      <div className="checkout-page__form flex w-full flex-col justify-center px-8 py-16 md:w-1/2 md:ml-20 md:pl-12 md:pr-16">
        <Link
          href="/shop/cart"
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors"
          style={{ color: 'var(--color-text-stat)' }}
        >
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Назад в корзину
        </Link>
        <h1
          className="text-right text-4xl font-bold text-white md:text-5xl"
          style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
        >
          Оформление заказа
        </h1>

        {paymentMock && !USE_WEBPAY && (
          <div
            className="mt-4 p-3 text-sm text-right"
            style={{
              border: '1px solid rgba(234,179,8,0.35)',
              background: 'rgba(234,179,8,0.1)',
              color: '#fbbf24',
              borderRadius: 8,
            }}
          >
            Тестовая оплата: ключи bePaid не подключены. Имитация виджета до получения договора.
          </div>
        )}

        {cancelled && (
          <div
            className="mt-4 p-3 text-sm text-right"
            style={{
              border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.1)',
              color: 'var(--color-loss)',
              borderRadius: 8,
            }}
          >
            Платёж не был завершён. Пожалуйста, попробуйте снова.
          </div>
        )}

        {pendingOrderId && paymentRemainingSeconds !== null && paymentRemainingSeconds > 0 && (
          <div
            className="mt-4 p-3 text-sm text-right"
            style={{
              border: '1px solid rgba(59,130,246,0.35)',
              background: 'rgba(59,130,246,0.1)',
              color: '#93c5fd',
              borderRadius: 8,
            }}
          >
            Оплатите заказ в течение{' '}
            <strong>{formatPaymentCountdown(paymentRemainingSeconds)}</strong>. После истечения{' '}
            {UNPAID_ORDER_PAYMENT_TTL_MINUTES} минут заказ будет отменён, а товары вернутся на склад.
          </div>
        )}

        {error && (
          <div
            className="mt-4 p-3 text-sm text-right"
            style={{
              border: '1px solid rgba(239,68,68,0.3)',
              background: 'rgba(239,68,68,0.1)',
              color: 'var(--color-loss)',
              borderRadius: 8,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <input
            type="text"
            value={form.customerName}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            placeholder="ФИО *"
            className="w-full p-3 text-sm text-white text-right outline-none"
            style={{
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-card)',
              borderRadius: 8,
            }}
            required
          />
          <input
            type="email"
            value={form.customerEmail}
            onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
            placeholder="Email *"
            className="w-full p-3 text-sm text-white text-right outline-none"
            style={{
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-card)',
              borderRadius: 8,
            }}
            required
          />
          <select
            value={form.countryId}
            onChange={(e) => setForm({ ...form, countryId: e.target.value })}
            className="shop-select shop-checkout__select text-right"
            required
          >
            <option value="">— Выберите страну доставки —</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{' '}
                {c.price && Number(c.price) > 0
                  ? `(${Number(c.price).toFixed(2)} BYN)`
                  : '(бесплатно)'}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Адрес доставки *"
            className="w-full p-3 text-sm text-white text-right outline-none"
            style={{
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-card)',
              borderRadius: 8,
            }}
            required
          />
          <textarea
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            placeholder="Комментарий к заказу"
            className="w-full p-3 text-sm text-white text-right outline-none"
            style={{
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-card)',
              borderRadius: 8,
            }}
            rows={3}
          />

          <div className="pt-6 space-y-2" style={{ borderTop: '1px solid var(--color-border)' }}>
            <div className="flex justify-end items-center gap-4 text-sm">
              <span style={{ color: 'var(--color-text-stat)' }}>Товары ({totalItems}):</span>
              <span className="text-white">{subtotal.toFixed(2)} BYN</span>
            </div>
            {deliveryPrice > 0 && (
              <div className="flex justify-end items-center gap-4 text-sm">
                <span style={{ color: 'var(--color-text-stat)' }}>Доставка:</span>
                <span className="text-white">{deliveryPrice.toFixed(2)} BYN</span>
              </div>
            )}
            <div className="flex justify-end items-center gap-4 text-lg font-bold">
              <span className="text-white">Итого:</span>
              <span className="text-white">{total.toFixed(2)} BYN</span>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading || processingPayment}
              className="inline-flex items-center gap-3 px-10 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors disabled:opacity-50"
              style={{ background: 'var(--color-accent)', borderRadius: 10 }}
            >
              {processingPayment ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" />{' '}
                  {USE_WEBPAY ? 'Перенаправление...' : 'Ожидание оплаты...'}
                </>
              ) : loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" /> Создание
                  заказа...
                </>
              ) : (
                <>
                  {payButtonLabel} <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="checkout-page__image relative hidden h-screen w-[50vw] md:block">
        <img
          src="/images/cart-bg.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute right-0 bottom-0 pointer-events-none select-none">
          <span
            className="block text-[80px] font-black uppercase tracking-[0.1em] text-white/20 md:text-[100px] leading-none"
            style={{
              writingMode: 'vertical-lr',
              fontFamily: "'Inter Tight', sans-serif",
              fontWeight: 900,
            }}
          >
            ЗАКАЗ
          </span>
        </div>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: 'var(--color-bg-main)' }}
    >
      <div className="text-center">
        <FontAwesomeIcon
          icon={faShoppingCart}
          className="text-6xl mb-6"
          style={{ color: 'var(--color-text-stat)' }}
        />
        <h1
          className="text-3xl font-bold text-white"
          style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
        >
          Корзина пуста
        </h1>
        <Link
          href="/shop/catalog"
          className="mt-8 inline-flex items-center gap-3 px-10 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors"
          style={{ background: 'var(--color-accent)', borderRadius: 10 }}
        >
          В каталог <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
        </Link>
      </div>
    </div>
  );
}
