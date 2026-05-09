// src/modules/admin/components/AdminSidebar.tsx - Боковое меню админки (glassmorphism)
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faNewspaper,
  faUsers,
  faCalendarDays,
  faTableList,
  faShirt,
  faShoppingCart,
  faAd,
  faTrophy,
  faLanguage,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';

const menuItems = [
  { title: 'Дашборд', href: '/admin/dashboard', icon: faHome },
  { title: 'Новости', href: '/admin/news', icon: faNewspaper },
  { title: 'Команды', href: '/admin/teams', icon: faUsers },
  { title: 'Игроки', href: '/admin/players', icon: faUsers },
  { title: 'Матчи', href: '/admin/matches', icon: faCalendarDays },
  { title: 'Таблицы', href: '/admin/standings', icon: faTableList },
  { title: 'Товары', href: '/admin/products', icon: faShirt },
  { title: 'Заказы', href: '/admin/orders', icon: faShoppingCart },
  { title: 'Баннеры', href: '/admin/banners', icon: faAd },
  { title: 'Титулы', href: '/admin/titles', icon: faTrophy },
  { title: 'Переводы', href: '/admin/translations', icon: faLanguage },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative flex w-64 flex-col overflow-hidden">
      {/* Фоновая картинка */}
      <div className="absolute inset-0">
        <img src="/images/stadium.jpg" alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#242C41]/90 backdrop-blur-sm" />
      </div>

      {/* Контент */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Логотип */}
        <div className="border-b border-white/10 p-6">
          <Link href="/admin/dashboard" className="flex justify-center">
            <img src="/images/logos/logo-white.png" alt="Динамо-Брест" className="h-12 w-auto" />
          </Link>
        </div>

        {/* Навигация */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-[#ee862c]/20 text-[#ee862c] shadow-lg shadow-[#ee862c]/10'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white hover:shadow-lg hover:shadow-black/20'
                }`}
              >
                {/* Фоновая иконка при наведении */}
                <span className="absolute inset-0 flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-5">
                  <FontAwesomeIcon icon={item.icon} className="mr-4 text-6xl text-white" />
                </span>
                <FontAwesomeIcon icon={item.icon} className="relative z-10 w-4 text-center" />
                <span className="relative z-10">{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Выход */}
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
