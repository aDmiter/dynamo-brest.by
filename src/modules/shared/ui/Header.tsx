// src/modules/shared/ui/Header.tsx - Шапка с иконками и выезжающими подписями (десктоп)
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useMemo } from 'react';
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
import { useSiteLocale } from '@/modules/shared/ui/SiteLocaleProvider';
import LanguageSwitcher from '@/modules/shared/ui/LanguageSwitcher';
import type { UiTranslationKey } from '@/config/ui-translations';

const NAV_ITEMS: { titleKey: UiTranslationKey; href: string; icon: IconDefinition }[] = [
  { titleKey: 'ui.nav.team', href: '/team/main/players', icon: faUserGroup },
  { titleKey: 'ui.nav.calendar', href: '/team/main/calendar', icon: faCalendarDays },
  { titleKey: 'ui.nav.table', href: '/team/main/table', icon: faTableList },
  { titleKey: 'ui.nav.news', href: '/news', icon: faNewspaper },
  { titleKey: 'ui.nav.shop', href: '/shop/catalog', icon: faBagShopping },
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
  const { t } = useSiteLocale();
  const [sideMenuVisible, setSideMenuVisible] = useState(true);
  const cartCount = useCartCount();
  const lastScrollY = useRef(0);

  const menuItems = useMemo(
    () => NAV_ITEMS.map((item) => ({ ...item, title: t(item.titleKey) })),
    [t],
  );

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
              key={item.titleKey}
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
            <span className="side-nav__flyout-label">{t('ui.cart')}</span>
          </span>
        </Link>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
