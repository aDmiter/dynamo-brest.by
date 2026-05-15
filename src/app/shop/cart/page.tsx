// src/app/shop/cart/page.tsx - Корзина
'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShoppingCart,
  faTrash,
  faMinus,
  faPlus,
  faArrowRight,
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
  customization?: {
    extraPrice: number;
    type?: string;
    playerName?: string;
    playerNumber?: string;
  } | null;
}

function getInitialCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  } catch {
    return [];
  }
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>(getInitialCart);

  const updateQuantity = (cartKey: string, delta: number) => {
    const newCart = cart
      .map((item) =>
        item.cartKey === cartKey ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
      )
      .filter((item) => item.quantity > 0);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (cartKey: string) => {
    const newCart = cart.filter((item) => item.cartKey !== cartKey);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
          <p className="mt-2" style={{ color: 'var(--color-text-stat)' }}>
            Добавьте товары из каталога
          </p>
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
      className="cart-page flex min-h-screen"
      style={{ background: 'var(--color-bg-main)', fontFamily: "'Inter Tight', sans-serif" }}
    >
      <div className="cart-page__info flex w-full flex-col justify-center px-8 py-16 md:w-1/2 md:ml-20 md:pl-12 md:pr-16">
        <h1
          className="text-right text-4xl font-bold text-white md:text-5xl"
          style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
        >
          Корзина{' '}
          <span className="text-lg ml-3" style={{ color: 'var(--color-text-stat)' }}>
            ({totalItems})
          </span>
        </h1>

        <div className="mt-8 space-y-3">
          {cart.map((item) => (
            <div
              key={item.cartKey}
              className="flex items-center gap-4 p-4"
              style={{
                border: '1px solid var(--color-border)',
                borderRadius: 12,
                background: 'var(--color-bg-card)',
              }}
            >
              <div
                className="h-16 w-16 flex-shrink-0 overflow-hidden"
                style={{ background: 'var(--color-bg-photo-placeholder)', borderRadius: 8 }}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FontAwesomeIcon
                      icon={faShoppingCart}
                      style={{ color: 'var(--color-text-label)' }}
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.productName}</p>
                {item.size && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-stat)' }}>
                    Размер: {item.size}
                  </p>
                )}
                {item.customization && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-accent)' }}>
                    Нанесение (+{item.customization.extraPrice.toFixed(2)} BYN)
                    {item.customization.playerName &&
                      ` — #${item.customization.playerNumber} ${item.customization.playerName}`}
                  </p>
                )}
                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-stat)' }}>
                  {item.price.toFixed(2)} BYN
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateQuantity(item.cartKey, -1)}
                  className="flex h-8 w-8 items-center justify-center transition-colors"
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 6,
                    color: 'var(--color-text-stat)',
                  }}
                >
                  <FontAwesomeIcon icon={faMinus} className="text-xs" />
                </button>
                <span className="w-8 text-center text-sm font-medium text-white">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.cartKey, 1)}
                  className="flex h-8 w-8 items-center justify-center transition-colors"
                  style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: 6,
                    color: 'var(--color-text-stat)',
                  }}
                >
                  <FontAwesomeIcon icon={faPlus} className="text-xs" />
                </button>
              </div>

              <button
                onClick={() => removeItem(item.cartKey)}
                className="flex h-8 w-8 items-center justify-center transition-colors"
                style={{ color: 'var(--color-text-stat)' }}
              >
                <FontAwesomeIcon icon={faTrash} className="text-sm" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
          <div className="flex justify-end items-center gap-4">
            <span style={{ color: 'var(--color-text-stat)' }}>Итого:</span>
            <span className="text-2xl font-bold text-white">{totalPrice.toFixed(2)} BYN</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Link
            href="/shop/checkout"
            className="inline-flex items-center gap-3 px-10 py-4 text-sm font-bold uppercase tracking-wider text-white transition-colors"
            style={{ background: 'var(--color-accent)', borderRadius: 10 }}
          >
            Оформить заказ <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </Link>
        </div>
      </div>

      <div className="cart-page__image relative hidden h-screen w-[50vw] md:block">
        <img
          src="/images/cart-bg.jpg"
          alt="Корзина"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute right-0 bottom-0 pointer-events-none select-none">
          <span
            className="block text-[80px] font-black uppercase tracking-[0.1em] text-white/20 md:text-[120px] leading-none"
            style={{
              writingMode: 'vertical-lr',
              fontFamily: "'Inter Tight', sans-serif",
              fontWeight: 900,
            }}
          >
            КОРЗИНА
          </span>
        </div>
      </div>
    </div>
  );
}
