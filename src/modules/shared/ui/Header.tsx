// src/modules/shared/ui/Header.tsx - Шапка с иконками и выезжающими подписями
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faTimes,
  faShoppingCart,
  faShieldHalved,
  faUsers,
  faStore,
  faNewspaper,
} from '@fortawesome/free-solid-svg-icons';

const menuItems = [
  { title: 'Клуб', href: '/club/about', icon: faShieldHalved },
  { title: 'Команда', href: '/team/main/players', icon: faUsers },
  { title: 'Магазин', href: '/shop/catalog', icon: faStore },
  { title: 'Новости', href: '/news', icon: faNewspaper },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sideMenuVisible, setSideMenuVisible] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const lastScrollY = useRef(0);

  // Следим за изменениями корзины
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const count = cart.reduce(
          (sum: number, item: { quantity: number }) => sum + item.quantity,
          0
        );
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('storage', updateCartCount);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  // Скрытие бокового меню при скролле
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const halfScreen = window.innerHeight * 0.5;

      if (currentScrollY > halfScreen) {
        setSideMenuVisible(false);
      } else {
        setSideMenuVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Вертикальное меню слева */}
      <header
        className={`fixed left-0 top-0 z-50 hidden h-screen w-20 flex-col items-center justify-between py-8 transition-all duration-500 lg:flex ${
          sideMenuVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        style={{ background: 'color-mix(in srgb, var(--color-bg-main) 80%, transparent)' }}
      >
        <Link href="/" className="flex flex-col items-center gap-2">
          <img src="/images/logos/logo-white.png" alt="Динамо-Брест" className="h-12 w-auto" />
        </Link>

        <nav className="flex flex-col items-center">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group relative flex h-16 w-20 items-center justify-center"
            >
              <FontAwesomeIcon
                icon={item.icon}
                className="relative z-10 text-2xl transition-colors"
                style={{ color: '#ffffff' }}
              />
              {/* Подсветка иконки при наведении */}
              <span
                className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
                style={{ color: 'var(--color-accent)' }}
              >
                <FontAwesomeIcon icon={item.icon} className="relative z-10 text-2xl" />
              </span>
              <div
                className="absolute left-0 top-0 flex h-full w-auto min-w-[200px] items-center gap-4 pl-20 pr-6 opacity-0 -translate-x-full transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none group-hover:pointer-events-auto"
                style={{ background: 'var(--color-bg-main)' }}
              >
                <span className="font-heading text-base font-bold text-white uppercase tracking-widest">
                  {item.title}
                </span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="flex flex-col items-center gap-4">
          <Link
            href="/shop/cart"
            className="group relative flex h-12 w-20 items-center justify-center"
          >
            <FontAwesomeIcon
              icon={faShoppingCart}
              className="relative z-10 text-xl transition-colors"
              style={{ color: '#ffffff' }}
            />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 right-2 z-20 flex h-5 w-5 items-center justify-center text-[10px] font-bold text-white"
                style={{ background: 'var(--color-accent)' }}
              >
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
            <div
              className="absolute left-0 top-0 flex h-full w-auto min-w-[180px] items-center gap-4 pl-20 pr-6 opacity-0 -translate-x-full transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 pointer-events-none group-hover:pointer-events-auto"
              style={{ background: 'var(--color-bg-main)' }}
            >
              <span className="font-heading text-base font-bold text-white uppercase tracking-widest">
                Корзина
              </span>
            </div>
          </Link>
          <button
            className="text-sm transition-colors"
            style={{ color: '#ffffff' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
            }}
          >
            RU
          </button>
        </div>
      </header>

      {/* Мобильный Header */}
      <header
        className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-4 py-3 lg:hidden"
        style={{ background: 'var(--color-bg-main)' }}
      >
        <Link href="/">
          <img src="/images/logos/logo-white.png" alt="Динамо-Брест" className="h-6 w-auto" />
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/shop/cart" className="relative" style={{ color: '#ffffff' }}>
            <FontAwesomeIcon icon={faShoppingCart} className="text-lg" />
            {cartCount > 0 && (
              <span
                className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center text-[9px] font-bold text-white"
                style={{ background: 'var(--color-accent)' }}
              >
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
          <button onClick={() => setMenuOpen(true)} style={{ color: '#ffffff' }}>
            <FontAwesomeIcon icon={faBars} className="text-xl" />
          </button>
        </div>
      </header>

      {/* Мобильное меню */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col lg:hidden"
          style={{ background: 'var(--color-bg-main)' }}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <span
              className="font-heading text-lg font-bold"
              style={{ color: 'var(--color-text-heading)' }}
            >
              Меню
            </span>
            <button onClick={() => setMenuOpen(false)} style={{ color: '#ffffff' }}>
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>
          <nav className="flex flex-col gap-0 px-4 pt-8">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 py-4 font-heading text-lg font-bold uppercase tracking-widest"
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  color: 'var(--color-text-heading)',
                }}
              >
                <FontAwesomeIcon icon={item.icon} style={{ color: 'var(--color-accent)' }} />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
