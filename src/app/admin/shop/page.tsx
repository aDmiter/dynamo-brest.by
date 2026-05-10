// src/app/admin/shop/page.tsx - Обзор интернет-магазина
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShirt,
  faShoppingCart,
  faBoxes,
  faTags,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';

export default async function ShopDashboardPage() {
  const [productsCount, categoriesCount, ordersCount, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.productcategory.count(),
    prisma.order.count(),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        orderitem: {
          include: {
            product: true,
          },
        },
      },
    }),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white mb-8">Интернет-магазин</h1>

      {/* Карточки статистики */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-10">
        <div className="border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Товаров</p>
              <p className="text-3xl font-bold text-white mt-1">{productsCount}</p>
            </div>
            <FontAwesomeIcon icon={faShirt} className="text-3xl text-[#ee862c]/50" />
          </div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 text-xs text-[#ee862c] mt-4 hover:underline"
          >
            Все товары <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
          </Link>
        </div>

        <div className="border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Категорий</p>
              <p className="text-3xl font-bold text-white mt-1">{categoriesCount}</p>
            </div>
            <FontAwesomeIcon icon={faTags} className="text-3xl text-[#ee862c]/50" />
          </div>
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 text-xs text-[#ee862c] mt-4 hover:underline"
          >
            Категории <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
          </Link>
        </div>

        <div className="border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Заказов</p>
              <p className="text-3xl font-bold text-white mt-1">{ordersCount}</p>
            </div>
            <FontAwesomeIcon icon={faShoppingCart} className="text-3xl text-[#ee862c]/50" />
          </div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 text-xs text-[#ee862c] mt-4 hover:underline"
          >
            Все заказы <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
          </Link>
        </div>
      </div>

      {/* Последние заказы */}
      <div className="border border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h2 className="font-heading text-lg font-bold text-white">Последние заказы</h2>
          <Link href="/admin/orders" className="text-sm text-[#ee862c] hover:underline">
            Все заказы →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Заказов пока нет</div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th className="p-3 text-left text-sm text-gray-400">№</th>
                <th className="p-3 text-left text-sm text-gray-400">Клиент</th>
                <th className="p-3 text-left text-sm text-gray-400">Телефон</th>
                <th className="p-3 text-center text-sm text-gray-400">Товаров</th>
                <th className="p-3 text-right text-sm text-gray-400">Сумма</th>
                <th className="p-3 text-center text-sm text-gray-400">Статус</th>
                <th className="p-3 text-left text-sm text-gray-400">Дата</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => (
                <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3 text-sm text-gray-500">#{index + 1}</td>
                  <td className="p-3 text-sm text-white">{order.customerName}</td>
                  <td className="p-3 text-sm text-gray-400">{order.customerPhone}</td>
                  <td className="p-3 text-center text-sm text-white">{order.orderitem.length}</td>
                  <td className="p-3 text-right text-sm text-white">
                    {Number(order.total).toFixed(2)} BYN
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`text-xs px-2 py-1 ${
                        order.status === 'new'
                          ? 'text-blue-400 bg-blue-400/10'
                          : order.status === 'processing'
                            ? 'text-yellow-400 bg-yellow-400/10'
                            : order.status === 'shipped'
                              ? 'text-purple-400 bg-purple-400/10'
                              : order.status === 'delivered'
                                ? 'text-green-400 bg-green-400/10'
                                : 'text-red-400 bg-red-400/10'
                      }`}
                    >
                      {order.status === 'new'
                        ? 'Новый'
                        : order.status === 'processing'
                          ? 'В обработке'
                          : order.status === 'shipped'
                            ? 'Отправлен'
                            : order.status === 'delivered'
                              ? 'Доставлен'
                              : order.status === 'cancelled'
                                ? 'Отменён'
                                : order.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
