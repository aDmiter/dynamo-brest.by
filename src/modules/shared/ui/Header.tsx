// src/modules/shared/ui/Header.tsx - Шапка сайта с навигацией
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFutbol, faBars } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

// Структура меню (позже будем загружать из админки или конфига)
const menuItems = [
  {
    title: 'Клуб',
    children: [
      { title: 'О клубе', href: '/club/about' },
      { title: 'История', href: '/club/history' },
      { title: 'Титулы', href: '/club/titles' },
      { title: 'Контакты', href: '/club/contacts' },
    ],
  },
  {
    title: 'Команда',
    children: [
      { title: 'Основной состав', href: '/team/main/players' },
      { title: 'Календарь', href: '/team/main/calendar' },
      { title: 'Результаты', href: '/team/main/results' },
      { title: 'Таблица', href: '/team/main/table' },
    ],
  },
  {
    title: 'Магазин',
    children: [
      { title: 'Каталог', href: '/shop/catalog' },
      { title: 'Корзина', href: '/shop/cart' },
    ],
  },
  {
    title: 'Новости',
    href: '/news',
  },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#003366] text-white shadow-lg">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        {/* Логотип */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <FontAwesomeIcon icon={faFutbol} className="text-xl" />
          <span>Динамо-Брест</span>
        </Link>

        {/* Десктопное меню */}
        <div className="hidden lg:block">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {menuItems.map((item) => (
                <NavigationMenuItem key={item.title}>
                  {item.children ? (
                    <>
                      <NavigationMenuTrigger className="bg-transparent text-white hover:bg-white/10 hover:text-white">
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="min-w-[200px] p-2">
                          {item.children.map((child) => (
                            <li key={child.title}>
                              <Link
                                href={child.href}
                                className="block rounded-md px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                              >
                                {child.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <Link
                      href={item.href || '/'}
                      className={`${navigationMenuTriggerStyle()} bg-transparent text-white hover:bg-white/10 hover:text-white`}
                    >
                      {item.title}
                    </Link>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Кнопки действий (десктоп) */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/shop/cart">
            <Button
              variant="outline"
              size="sm"
              className="border-white text-gray-800 hover:bg-white hover:text-[#003366]"
            >
              Корзина
            </Button>
          </Link>
          <span className="cursor-pointer text-sm hover:underline">RU / BY</span>
        </div>

        {/* Мобильное меню (гамбургер) */}
        <div className="lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10">
              <FontAwesomeIcon icon={faBars} className="text-xl" />
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-[#003366] text-white">
              <SheetTitle className="text-white text-lg font-bold mb-4">
                <FontAwesomeIcon icon={faFutbol} className="mr-2" />
                Динамо-Брест
              </SheetTitle>
              <nav className="flex flex-col gap-2">
                {menuItems.map((item) => (
                  <div key={item.title} className="border-b border-white/20 pb-2">
                    {item.href && !item.children ? (
                      <Link
                        href={item.href}
                        className="block py-2 text-lg font-medium hover:text-gray-300"
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.title}
                      </Link>
                    ) : (
                      <>
                        <span className="block py-2 text-lg font-medium">{item.title}</span>
                        {item.children?.map((child) => (
                          <Link
                            key={child.title}
                            href={child.href}
                            className="block py-1 pl-4 text-base text-gray-300 hover:text-white"
                            onClick={() => setMobileOpen(false)}
                          >
                            {child.title}
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
