// src/app/admin/orders/page.tsx - Управление заказами
import { prisma } from '@/lib/prisma';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import OrderStatusBadge from './OrderStatusBadge';

export default async function OrdersAdminPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      orderitem: {
        include: { product: true },
      },
    },
    take: 50,
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white mb-8">Заказы</h1>

      <div className="border border-white/10 bg-white/5 backdrop-blur-sm">
        <table className="w-full">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="p-3 text-left text-sm text-gray-400">Номер</th>
              <th className="p-3 text-left text-sm text-gray-400">Клиент</th>
              <th className="p-3 text-left text-sm text-gray-400">Телефон</th>
              <th className="p-3 text-center text-sm text-gray-400">Товаров</th>
              <th className="p-3 text-right text-sm text-gray-400">Сумма</th>
              <th className="p-3 text-center text-sm text-gray-400">Статус</th>
              <th className="p-3 text-left text-sm text-gray-400">Дата</th>
              <th className="p-3 text-center text-sm text-gray-400">Действия</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-500">
                  Нет заказов
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-3 text-sm text-white font-medium">
                    {order.orderNumber || `#${order.id.slice(-6)}`}
                  </td>
                  <td className="p-3 text-sm text-white">{order.customerName}</td>
                  <td className="p-3 text-sm text-gray-400">{order.customerPhone}</td>
                  <td className="p-3 text-center text-sm text-white">{order.orderitem.length}</td>
                  <td className="p-3 text-right text-sm text-white font-medium">
                    {Number(order.total).toFixed(2)} BYN
                  </td>
                  <td className="p-3 text-center">
                    <OrderStatusBadge orderId={order.id} status={order.status} />
                  </td>
                  <td className="p-3 text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="p-3 text-center">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-sm text-[#ee862c] hover:underline"
                    >
                      <FontAwesomeIcon icon={faEye} /> Смотреть
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
