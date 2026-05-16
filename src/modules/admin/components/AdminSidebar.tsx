// src/modules/admin/components/AdminSidebar.tsx - Боковое меню админки
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faNewspaper,
  faUsers,
  faUserTie,
  faCalendarDays,
  faTableList,
  faAd,
  faTrophy,
  faLanguage,
  faSignOutAlt,
  faHandshake,
  faStore,
  faChevronDown,
  faShieldHalved,
  faFutbol,
  faCog,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';

interface MenuChild {
  title: string;
  href?: string;
  children?: MenuChild[];
}

interface MenuItem {
  title: string;
  href?: string;
  icon: IconDefinition;
  children?: MenuChild[];
}

const menuItems: MenuItem[] = [
  { title: 'Дашборд', href: '/admin/dashboard', icon: faHome },
  { title: 'Новости', href: '/admin/news', icon: faNewspaper },
  {
    title: 'Игроки',
    icon: faUsers,
    children: [
      { title: 'Все игроки', href: '/admin/players' },
      { title: 'Основной состав', href: '/admin/players/osnovnoy-sostav' },
      { title: 'Дублирующий состав', href: '/admin/players/dubliruyushchiy-sostav' },
      { title: 'Женская команда', href: '/admin/players/zhenskaya-komanda' },
    ],
  },
  { title: 'Тренеры', href: '/admin/coaches', icon: faUserTie },
  { title: 'Клубы', href: '/admin/opponent-teams', icon: faShieldHalved },
  {
    title: 'Матчи',
    icon: faFutbol,
    children: [
      {
        title: 'Календарь',
        children: [
          { title: 'Основной состав', href: '/admin/matches/calendar/osnovnoy-sostav' },
          { title: 'Дублирующий состав', href: '/admin/matches/calendar/dubliruyushchiy-sostav' },
          { title: 'Женская команда', href: '/admin/matches/calendar/zhenskaya-komanda' },
        ],
      },
      {
        title: 'Результаты',
        children: [
          { title: 'Основной состав', href: '/admin/matches/results/osnovnoy-sostav' },
          { title: 'Дублирующий состав', href: '/admin/matches/results/dubliruyushchiy-sostav' },
          { title: 'Женская команда', href: '/admin/matches/results/zhenskaya-komanda' },
        ],
      },
    ],
  },
  {
    title: 'Интернет-магазин',
    icon: faStore,
    children: [
      { title: 'Обзор', href: '/admin/shop' },
      { title: 'Товары', href: '/admin/products' },
      { title: 'Категории', href: '/admin/categories' },
      { title: 'Заказы', href: '/admin/orders' },
      { title: 'Страны', href: '/admin/countries' },
      { title: 'Доп. поля', href: '/admin/shop/fields' },
    ],
  },
  { title: 'Таблицы', href: '/admin/standings', icon: faTableList },
  { title: 'Баннеры', href: '/admin/banners', icon: faAd },
  { title: 'Спонсоры', href: '/admin/sponsors', icon: faHandshake },
  { title: 'Титулы', href: '/admin/titles', icon: faTrophy },
  { title: 'Переводы', href: '/admin/translations', icon: faLanguage },
  {
    title: 'Настройки',
    icon: faCog,
    children: [
      { title: 'Главное меню', href: '/admin/settings/menu' },
      { title: 'Нижнее меню', href: '/admin/settings/footer-menu' },
      { title: 'Ключи API', href: '/admin/settings/keys' },
      { title: 'Настройки сайта', href: '/admin/settings' },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isChildActive = (children: MenuChild[]): boolean => {
    return children.some((child) => {
      if (child.children) return isChildActive(child.children);
      return (
        pathname === child.href || (child.href ? pathname.startsWith(child.href + '/') : false)
      );
    });
  };

  const renderChildren = (children: MenuChild[], parentKey: string, level: number = 0) => {
    return (
      <div
        className={`${level === 0 ? 'ml-7 mt-1 space-y-1 border-l border-white/10 pl-4' : 'ml-4 mt-1 space-y-1 border-l border-white/10 pl-3'}`}
      >
        {children.map((child) => {
          if (child.children) {
            const childKey = `${parentKey}_${child.title}`;
            const active = isChildActive(child.children);
            return (
              <div key={childKey}>
                <button
                  onClick={() => toggleMenu(childKey)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${active ? 'text-[#ee862c]' : 'text-gray-500 hover:text-white'}`}
                >
                  {child.title}
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`w-2.5 transition-transform ${openMenus[childKey] ? 'rotate-180' : ''}`}
                  />
                </button>
                {openMenus[childKey] && renderChildren(child.children, childKey, level + 1)}
              </div>
            );
          }
          const active =
            pathname === child.href || (child.href ? pathname.startsWith(child.href + '/') : false);
          return (
            <Link
              key={child.href}
              href={child.href || '#'}
              className={`block px-4 py-2 text-sm transition-colors ${active ? 'text-[#ee862c]' : 'text-gray-500 hover:text-white'}`}
            >
              {child.title}
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <aside className="relative flex w-64 flex-col overflow-hidden">
      <div className="absolute inset-0">
        <img src="/images/stadium.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#242C41]/90 backdrop-blur-sm" />
      </div>
      <div className="relative z-10 flex h-full flex-col">
        <div className="border-b border-white/10 p-6">
          <Link href="/admin/dashboard" className="flex justify-center">
            <img src="/images/logos/logo-white.png" alt="Динамо-Брест" className="h-12 w-auto" />
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {menuItems.map((item) => {
            let menuKey = '';
            if (item.children) {
              if (item.title === 'Игроки') menuKey = 'players';
              else if (item.title === 'Матчи') menuKey = 'matches';
              else if (item.title === 'Интернет-магазин') menuKey = 'shop';
              else if (item.title === 'Настройки') menuKey = 'settings';
              const active = item.children ? isChildActive(item.children) : false;
              return (
                <div key={item.title}>
                  <button
                    onClick={() => toggleMenu(menuKey)}
                    className={`group relative flex w-full items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-300 ${active || openMenus[menuKey] ? 'bg-[#ee862c]/20 text-[#ee862c] shadow-lg shadow-[#ee862c]/10' : 'text-gray-400 hover:bg-white/5 hover:text-white hover:shadow-lg hover:shadow-black/20'}`}
                  >
                    <span className="absolute inset-0 flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-5">
                      <FontAwesomeIcon icon={item.icon} className="mr-4 text-6xl text-white" />
                    </span>
                    <FontAwesomeIcon icon={item.icon} className="relative z-10 w-4 text-center" />
                    <span className="relative z-10 flex-1 text-left">{item.title}</span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`relative z-10 w-3 transition-transform ${openMenus[menuKey] ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openMenus[menuKey] && item.children && renderChildren(item.children, menuKey)}
                </div>
              );
            }
            const active =
              pathname === item.href || (item.href ? pathname.startsWith(item.href + '/') : false);
            return (
              <Link
                key={item.href}
                href={item.href || '#'}
                className={`group relative flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-300 ${active ? 'bg-[#ee862c]/20 text-[#ee862c] shadow-lg shadow-[#ee862c]/10' : 'text-gray-400 hover:bg-white/5 hover:text-white hover:shadow-lg hover:shadow-black/20'}`}
              >
                <span className="absolute inset-0 flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-5">
                  <FontAwesomeIcon icon={item.icon} className="mr-4 text-6xl text-white" />
                </span>
                <FontAwesomeIcon icon={item.icon} className="relative z-10 w-4 text-center" />
                <span className="relative z-10">{item.title}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="group relative flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="w-4" />
            <span>Выйти</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
