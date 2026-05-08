// src/modules/admin/components/AdminSidebar.tsx - Боковое меню админки
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFutbol,
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
import { Button } from '@/components/ui/button';

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
    <aside className="w-64 bg-[#003366] text-white flex flex-col">
      {/* Логотип админки */}
      <div className="p-4 border-b border-white/10">
        <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-bold">
          <FontAwesomeIcon icon={faFutbol} />
          <span>Админ-панель</span>
        </Link>
      </div>

      {/* Навигация */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-white/20 text-white font-medium'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Выход */}
      <div className="p-4 border-t border-white/10">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 w-4" />
          Выйти
        </Button>
      </div>
    </aside>
  );
}
