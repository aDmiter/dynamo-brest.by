// src/app/shop/cart/page.tsx - Корзина
'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faTrash, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price?: number;
  image?: string;
}

export default function CartPage() {
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

  const updateQuantity = (productId: string, delta: number) => {
    const newCart = cart
      .map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
      .filter((item) => item.quantity > 0);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (productId: string) => {
    const newCart = cart.filter((item) => item.productId !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <FontAwesomeIcon icon={faShoppingCart} className="text-6xl text-gray-300" />
        <h1 className="mt-4 text-2xl font-bold text-[#003366]">Корзина пуста</h1>
        <p className="mt-2 text-gray-500">Добавьте товары из каталога</p>
        <Link href="/shop/catalog">
          <Button className="mt-6 bg-[#003366] hover:bg-[#002244]">Перейти в каталог</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-[#003366]">Корзина ({totalItems})</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Список товаров */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 rounded-xl bg-white p-4 shadow"
            >
              <div className="flex-1">
                <h3 className="font-medium">{item.productName}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.productId, -1)}
                  className="rounded-md border p-1 hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faMinus} className="w-3" />
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, 1)}
                  className="rounded-md border p-1 hover:bg-gray-100"
                >
                  <FontAwesomeIcon icon={faPlus} className="w-3" />
                </button>
              </div>
              <button
                onClick={() => removeItem(item.productId)}
                className="text-red-500 hover:text-red-700 p-2"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}
        </div>

        {/* Итого */}
        <div className="rounded-xl bg-white p-6 shadow h-fit">
          <h2 className="text-lg font-bold text-[#003366]">Итого</h2>
          <div className="mt-2 flex justify-between text-sm text-gray-500">
            <span>Товаров:</span>
            <span>{totalItems} шт.</span>
          </div>
          <div className="mt-4 border-t pt-4">
            <p className="text-center text-gray-500">Для оформления заказа войдите в систему</p>
            <Button className="mt-4 w-full bg-[#003366] hover:bg-[#002244]" disabled>
              Оформить заказ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
