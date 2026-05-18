// src/modules/shared/ui/BurgerMenu.tsx - Бургер-меню
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faChevronRight, faCartShopping } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import { useCartCount } from '@/modules/shared/hooks/useCartCount';

function isMenuLinkActive(href: string, pathname: string): boolean {
  if (!href || href === '#' || href.startsWith('http')) return false;
  if (pathname === href) return true;
  return href !== '/' && pathname.startsWith(`${href}/`);
}

interface MenuItem {
  id: string;
  title: string;
  slug: string;
  type: string;
  linkUrl: string | null;
  pageContent: string | null;
  parentId: string | null;
  isActive: boolean;
  isExternal: boolean;
  children: MenuItem[];
}

export default function BurgerMenu() {
  const pathname = usePathname();
  const cartCount = useCartCount();
  const [isOpen, setIsOpen] = useState(false);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/menu')
      .then((r) => r.json())
      .then((data) => setMenu(data.filter((item: MenuItem) => item.isActive)));
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setOpenSubmenu(null);
    setIsOpen(false);
  };

  const getUrl = (item: MenuItem): string => {
    if (item.linkUrl) return item.linkUrl;
    if (item.type === 'page') return `/page/${item.slug}`;
    return '#';
  };

  return (
    <>
      <Link href="/" className="burger-menu__mobile-logo" aria-label="На главную">
        <img
          src="/images/logos/logo-white.png"
          alt="Динамо-Брест"
          className="burger-menu__mobile-logo-img"
        />
      </Link>

      <div className="burger-menu__actions">
        <Link href="/shop/cart" className="burger-menu__btn burger-menu__btn--cart" aria-label="Корзина">
          <FontAwesomeIcon icon={faCartShopping} className="burger-menu__btn-icon" />
          {cartCount > 0 && (
            <span className="burger-menu__cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="burger-menu__btn burger-menu__btn--menu"
          aria-label="Меню"
        >
          <FontAwesomeIcon icon={faBars} className="burger-menu__btn-icon" />
        </button>
      </div>

      {/* Меню */}
      {isOpen && (
        <div className="burger-menu__overlay">
          {/* Левая панель с логотипом */}
          <div
            className="burger-menu__aside"
          >
            <img
              src="/images/logos/logo-white.png"
              alt="Динамо-Брест"
              className="burger-menu__aside-logo"
            />
          </div>

          {/* Основное меню */}
          <div className="burger-menu__panel">
            {/* Шапка */}
            <div className="burger-menu__header">
              <img
                src="/images/logos/logo-white.png"
                alt="Динамо-Брест"
                className="burger-menu__header-logo"
              />
              <button
                type="button"
                onClick={handleClose}
                className="burger-menu__btn burger-menu__btn--close burger-menu__header-close"
                aria-label="Закрыть меню"
              >
                <FontAwesomeIcon icon={faTimes} className="burger-menu__btn-icon" />
              </button>
            </div>

            {/* Список меню */}
            <div className="p-6 lg:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {menu.map((item) => {
                  const activeChildren = (item.children ?? []).filter((child) => child.isActive);
                  const sectionActive = activeChildren.some((child) =>
                    isMenuLinkActive(getUrl(child), pathname)
                  );

                  return (
                    <div key={item.id} className="space-y-3">
                      <h3
                        className="font-heading text-lg font-bold uppercase tracking-wider transition-colors"
                        style={{
                          color: sectionActive
                            ? 'var(--color-accent)'
                            : 'var(--color-text-heading)',
                        }}
                      >
                        {item.title}
                      </h3>
                      {activeChildren.length > 0 && (
                        <ul className="space-y-1">
                          {activeChildren.map((child) => {
                            const href = getUrl(child);
                            const isActive = isMenuLinkActive(href, pathname);

                            return (
                              <li key={child.id}>
                                <Link
                                  href={href}
                                  onClick={handleClose}
                                  target={child.isExternal ? '_blank' : undefined}
                                  aria-current={isActive ? 'page' : undefined}
                                  className="flex items-center gap-2 text-sm py-1.5 transition-colors"
                                  style={{
                                    color: isActive
                                      ? 'var(--color-accent)'
                                      : 'var(--color-text-stat)',
                                    fontWeight: isActive ? 600 : 400,
                                  }}
                                  onMouseEnter={(e) => {
                                    const el = e.currentTarget as HTMLAnchorElement;
                                    el.style.color = 'var(--color-accent)';
                                  }}
                                  onMouseLeave={(e) => {
                                    const el = e.currentTarget as HTMLAnchorElement;
                                    el.style.color = isActive
                                      ? 'var(--color-accent)'
                                      : 'var(--color-text-stat)';
                                  }}
                                >
                                  <FontAwesomeIcon
                                    icon={faChevronRight}
                                    className="text-[8px] transition-colors"
                                    style={{
                                      color: isActive
                                        ? 'var(--color-accent)'
                                        : 'var(--color-text-label)',
                                    }}
                                  />
                                  {child.title}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Футер меню */}
            <div
              className="p-6 lg:p-12 mt-8"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              <p className="text-sm" style={{ color: 'var(--color-text-label)' }}>
                © {new Date().getFullYear()} ФК «Динамо-Брест»
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
