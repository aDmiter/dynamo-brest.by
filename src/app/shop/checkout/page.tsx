// src/app/shop/checkout/page.tsx - Оформление заказа с WebPay
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faArrowRight,
  faArrowLeft,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

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
  const searchParams = useSearchParams();
  const cancelled = searchParams.get('cancelled');

  const [cart, setCart] = useState<CartItem[]>(() => {
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
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const selectedCountry = countries.find((c) => c.id === form.countryId);
  const deliveryPrice = selectedCountry?.price ? Number(selectedCountry.price) : 0;
  const total = subtotal + deliveryPrice;

  const submitToWebPay = (params: Record<string, string>) => {
    try {
      sessionStorage.setItem('webpay_params', JSON.stringify(params));
    } catch {}

    const formElement = document.createElement('form');
    formElement.method = 'POST';
    formElement.action = 'https://securesandbox.webpay.by';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Создаём заказ со статусом pending_payment — без списания остатков
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: '',
          address: form.address,
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
          status: 'pending_payment',
          skipStockUpdate: true, // НЕ списываем остатки до оплаты
        }),
      });

      const orderData = await res.json();

      if (res.ok) {
        const orderNumber = orderData.orderNumber || orderData.id;

        const cartItems = cart.map((item) => ({
          name: item.productName + (item.size ? ` (${item.size})` : ''),
          quantity: item.quantity,
          price: item.price,
        }));

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
          // Сохраняем заказ в sessionStorage, чтобы на success странице обновить статус
          sessionStorage.setItem('pending_order_id', orderData.id);
          submitToWebPay(signData.params);
        } else {
          setError(signData.error || 'Не удалось создать платёж');
        }
      } else {
        setError(orderData.error || 'Ошибка при создании заказа');
      }
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
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

  return (
    <div
      className="checkout-page flex min-h-screen"
      style={{ background: 'var(--color-bg-main)', fontFamily: "'Inter Tight', sans-serif" }}
    >
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
                  Перенаправление...
                </>
              ) : loading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" /> Создание
                  заказа...
                </>
              ) : (
                <>
                  Оплатить через WebPay <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
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
