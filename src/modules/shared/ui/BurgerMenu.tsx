// src/modules/shared/ui/BurgerMenu.tsx - Бургер-меню
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

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
    if (item.type === 'link' && item.linkUrl) return item.linkUrl;
    if (item.type === 'page') return `/page/${item.slug}`;
    return '#';
  };

  return (
    <>
      {/* Кнопка бургера */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed right-6 top-6 z-40 flex h-12 w-12 items-center justify-center transition-all lg:right-8 lg:top-8"
        style={{
          border: '1px solid var(--color-border)',
          background: 'transparent',
          backdropFilter: 'blur(12px)',
          color: '#ffffff',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.borderColor = 'var(--color-accent)';
          el.style.color = 'var(--color-accent)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLButtonElement;
          el.style.borderColor = 'var(--color-border)';
          el.style.color = '#ffffff';
        }}
        aria-label="Меню"
      >
        <FontAwesomeIcon icon={faBars} className="text-xl" />
      </button>

      {/* Меню */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex" style={{ background: 'var(--color-bg-main)' }}>
          {/* Левая панель с логотипом */}
          <div
            className="hidden lg:flex w-20 flex-col items-center pt-8"
            style={{ borderRight: '1px solid var(--color-border)' }}
          >
            <img src="/images/logos/logo-white.png" alt="Динамо-Брест" className="h-12 w-auto" />
          </div>

          {/* Основное меню */}
          <div className="flex-1 overflow-y-auto">
            {/* Шапка */}
            <div
              className="flex items-center justify-between p-6"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <img
                src="/images/logos/logo-white.png"
                alt="Динамо-Брест"
                className="h-6 w-auto lg:hidden"
              />
              <button
                onClick={handleClose}
                className="flex h-12 w-12 items-center justify-center ml-auto transition-all"
                style={{
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-nav)',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = 'var(--color-accent)';
                  el.style.color = 'var(--color-accent)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = 'var(--color-border)';
                  el.style.color = 'var(--color-text-nav)';
                }}
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
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
