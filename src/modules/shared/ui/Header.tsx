// src/modules/shared/ui/Header.tsx - Шапка с иконками и выезжающими подписями (десктоп)
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBagShopping,
  faCartShopping,
  faCalendarDays,
  faNewspaper,
  faTableList,
  faUserGroup,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { useCartCount } from '@/modules/shared/hooks/useCartCount';

const menuItems: { title: string; href: string; icon: IconDefinition }[] = [
  { title: 'Команда', href: '/team/main/players', icon: faUserGroup },
  { title: 'Календарь', href: '/team/main/calendar', icon: faCalendarDays },
  { title: 'Таблица', href: '/team/main/table', icon: faTableList },
  { title: 'Новости', href: '/news', icon: faNewspaper },
  { title: 'Магазин', href: '/shop/catalog', icon: faBagShopping },
];

function isNavItemActive(href: string, pathname: string): boolean {
  if (href === '/news') {
    return pathname === '/news' || pathname.startsWith('/news/');
  }
  if (href.startsWith('/shop')) {
    return pathname.startsWith('/shop');
  }
  if (href.includes('/calendar')) {
    return pathname.includes('/calendar');
  }
  if (href.includes('/table')) {
    return pathname.includes('/table');
  }
  if (href.includes('/players')) {
    return (
      pathname.startsWith('/team/') &&
      (pathname.includes('/players') || pathname.includes('/coaches'))
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();
  const [sideMenuVisible, setSideMenuVisible] = useState(true);
  const cartCount = useCartCount();
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const halfScreen = window.innerHeight * 0.5;
      setSideMenuVisible(currentScrollY <= halfScreen);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 top-0 z-50 hidden h-screen w-20 flex-col items-center justify-between py-8 transition-all duration-500 lg:flex ${
        sideMenuVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{ background: 'color-mix(in srgb, var(--color-bg-main) 80%, transparent)' }}
    >
      <Link href="/" className="flex flex-col items-center gap-2">
        <img src="/images/logos/logo-white.png" alt="Динамо-Брест" className="h-12 w-auto" />
      </Link>

      <nav className="flex flex-col items-center gap-1">
        {menuItems.map((item) => {
          const active = isNavItemActive(item.href, pathname);
          return (
            <Link
              key={item.title}
              href={item.href}
              className={`side-nav__item group ${active ? 'side-nav__item--active' : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="side-nav__icon-wrap">
                <FontAwesomeIcon icon={item.icon} className="side-nav__icon" />
              </span>
              <span className="side-nav__flyout">
                <span className="side-nav__flyout-label">{item.title}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col items-center gap-3">
        <Link href="/shop/cart" className="side-nav__cart group">
          <span className="side-nav__icon-wrap">
            <FontAwesomeIcon icon={faCartShopping} className="side-nav__icon" />
          </span>
          {cartCount > 0 && (
            <span className="side-nav__cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
          )}
          <span className="side-nav__flyout">
            <span className="side-nav__flyout-label">Корзина</span>
          </span>
        </Link>
        <button
          type="button"
          className="text-xs font-medium tracking-widest transition-colors"
          style={{ color: 'rgba(255,255,255,0.45)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-accent)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)';
          }}
        >
          RU
        </button>
      </div>
    </header>
  );
}
