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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <FontAwesomeIcon icon={faShoppingCart} className="text-6xl text-gray-300 mb-6" />
          <h1
            className="font-heading text-3xl font-bold text-[#242C41]"
            style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
          >
            Корзина пуста
          </h1>
          <p className="mt-2 text-gray-500">Добавьте товары из каталога</p>
          <Link
            href="/shop/catalog"
            className="mt-8 inline-flex items-center gap-3 bg-[#ee862c] px-10 py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#f0ac74] transition-colors"
          >
            В каталог <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page flex min-h-screen bg-white">
      <div className="cart-page__info flex w-full flex-col justify-center px-8 py-16 md:w-1/2 md:ml-20 md:pl-12 md:pr-16">
        <h1
          className="text-right text-4xl font-bold text-[#242C41] md:text-5xl"
          style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
        >
          Корзина <span className="text-lg text-gray-400 ml-3">({totalItems})</span>
        </h1>

        <div className="mt-8 space-y-3">
          {cart.map((item) => (
            <div key={item.cartKey} className="flex items-center gap-4 border border-gray-200 p-4">
              <div className="h-16 w-16 flex-shrink-0 bg-gray-100">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FontAwesomeIcon icon={faShoppingCart} className="text-gray-300" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#242C41] truncate">{item.productName}</p>
                {item.size && <p className="text-xs text-gray-400 mt-0.5">Размер: {item.size}</p>}
                {item.customization && (
                  <p className="text-xs text-[#ee862c] mt-0.5">
                    Нанесение (+{item.customization.extraPrice.toFixed(2)} BYN)
                    {item.customization.playerName &&
                      ` — #${item.customization.playerNumber} ${item.customization.playerName}`}
                  </p>
                )}
                <p className="text-sm text-gray-400 mt-0.5">{item.price.toFixed(2)} BYN</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateQuantity(item.cartKey, -1)}
                  className="flex h-8 w-8 items-center justify-center border border-gray-300 text-gray-400 hover:border-[#242C41] hover:text-[#242C41] transition-colors"
                >
                  <FontAwesomeIcon icon={faMinus} className="text-xs" />
                </button>
                <span className="w-8 text-center text-sm font-medium text-[#242C41]">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.cartKey, 1)}
                  className="flex h-8 w-8 items-center justify-center border border-gray-300 text-gray-400 hover:border-[#242C41] hover:text-[#242C41] transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-xs" />
                </button>
              </div>

              <button
                onClick={() => removeItem(item.cartKey)}
                className="flex h-8 w-8 items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
              >
                <FontAwesomeIcon icon={faTrash} className="text-sm" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <div className="flex justify-end items-center gap-4">
            <span className="text-sm text-gray-500">Итого:</span>
            <span className="text-2xl font-bold text-[#242C41]">{totalPrice.toFixed(2)} BYN</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Link
            href="/shop/checkout"
            className="inline-flex items-center gap-3 bg-[#ee862c] px-10 py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-[#f0ac74] transition-colors"
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
