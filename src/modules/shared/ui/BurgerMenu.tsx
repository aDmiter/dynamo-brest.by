// src/modules/shared/ui/BurgerMenu.tsx - Бургер-меню
'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

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
  const [isOpen, setIsOpen] = useState(false);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/menu')
      .then((r) => r.json())
      .then((data) => setMenu(data.filter((item: MenuItem) => item.isActive)));
  }, []);

  // Блокировка скролла при открытии меню
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
        className="fixed right-6 top-6 z-40 flex h-12 w-12 items-center justify-center border border-white/20 bg-white/5 backdrop-blur-md text-white hover:border-[#ee862c] hover:text-[#ee862c] transition-all lg:right-8 lg:top-8"
        aria-label="Меню"
      >
        <FontAwesomeIcon icon={faBars} className="text-xl" />
      </button>

      {/* Меню */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#242C41] flex">
          {/* Левая панель с логотипом */}
          <div className="hidden lg:flex w-20 border-r border-white/10 flex-col items-center pt-8">
            <img src="/images/logos/logo-white.png" alt="Динамо-Брест" className="h-12 w-auto" />
          </div>

          {/* Основное меню */}
          <div className="flex-1 overflow-y-auto">
            {/* Шапка */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <img
                src="/images/logos/logo-white.png"
                alt="Динамо-Брест"
                className="h-6 w-auto lg:hidden"
              />
              <button
                onClick={handleClose}
                className="flex h-12 w-12 items-center justify-center border border-white/20 text-white hover:border-[#ee862c] hover:text-[#ee862c] transition-all ml-auto"
              >
                <FontAwesomeIcon icon={faTimes} className="text-xl" />
              </button>
            </div>

            {/* Список меню */}
            <div className="p-6 lg:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {menu.map((item) => (
                  <div key={item.id} className="space-y-3">
                    <h3 className="font-heading text-lg font-bold text-white uppercase tracking-wider">
                      {item.title}
                    </h3>
                    {item.children && item.children.length > 0 && (
                      <ul className="space-y-1">
                        {item.children
                          .filter((child) => child.isActive)
                          .map((child) => (
                            <li key={child.id}>
                              <Link
                                href={getUrl(child)}
                                onClick={handleClose}
                                target={child.isExternal ? '_blank' : undefined}
                                className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#ee862c] transition-colors py-1.5 group"
                              >
                                <FontAwesomeIcon
                                  icon={faChevronRight}
                                  className="text-[8px] text-gray-600 group-hover:text-[#ee862c] transition-colors"
                                />
                                {child.title}
                              </Link>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Футер меню */}
            <div className="border-t border-white/10 p-6 lg:p-12 mt-8">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} ФК «Динамо-Брест»
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
