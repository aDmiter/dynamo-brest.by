// src/app/admin/orders/[id]/page.tsx - Детали заказа
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
  faComment,
  faTruck,
} from '@fortawesome/free-solid-svg-icons';
import OrderStatusBadge from '../OrderStatusBadge';
import TrackingCodeInput from './TrackingCodeInput';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { orderitem: { include: { product: true } } },
  });

  if (!order) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/orders" className="text-gray-400 hover:text-white transition-colors">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Назад
        </Link>
        <h1 className="font-heading text-2xl font-bold text-white">
          Заказ {order.orderNumber || `#${order.id.slice(-6)}`}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <h2 className="font-heading text-lg font-bold text-white mb-4">Товары</h2>

          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="p-2 text-left text-sm text-gray-400">Товар</th>
                <th className="p-2 text-center text-sm text-gray-400">Размер</th>
                <th className="p-2 text-left text-sm text-gray-400">Нанесение</th>
                <th className="p-2 text-center text-sm text-gray-400">Кол-во</th>
                <th className="p-2 text-right text-sm text-gray-400">Цена</th>
                <th className="p-2 text-right text-sm text-gray-400">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {order.orderitem.map((item) => {
                const customization = item.customization ? JSON.parse(item.customization) : null;
                return (
                  <tr key={item.id} className="border-b border-white/5">
                    <td className="p-2 text-sm text-white">{item.product.name}</td>
                    <td className="p-2 text-center text-sm text-gray-400">{item.size || '—'}</td>
                    <td className="p-2 text-sm text-gray-400">
                      {customization ? (
                        <div className="space-y-1">
                          <p className="text-xs text-white">
                            {customization.type === 'full'
                              ? 'Полное нанесение'
                              : 'Выборочное нанесение'}
                            {customization.extraPrice > 0 && (
                              <span className="text-[#ee862c]">
                                {' '}
                                (+{customization.extraPrice.toFixed(2)} BYN)
                              </span>
                            )}
                          </p>
                          {customization.type === 'full' && (
                            <p className="text-xs text-gray-500">
                              {customization.playerId
                                ? `Игрок: #${customization.playerNumber} ${customization.playerName}`
                                : `Номер: ${customization.customNumber}, Фамилия: ${customization.customName}`}
                            </p>
                          )}
                          {customization.logos && customization.logos.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {customization.logos.map(
                                (logo: {
                                  id: string;
                                  name: string;
                                  imageUrl: string;
                                  price: number;
                                }) => (
                                  <span
                                    key={logo.id}
                                    className="inline-flex items-center gap-1 border border-white/10 px-2 py-0.5 text-xs text-gray-400"
                                  >
                                    {logo.imageUrl && (
                                      <img
                                        src={logo.imageUrl}
                                        alt={logo.name}
                                        className="h-4 w-auto object-contain"
                                      />
                                    )}
                                    {logo.name}
                                    {logo.price > 0 && (
                                      <span className="text-[10px] text-[#ee862c]">
                                        +{logo.price.toFixed(2)}
                                      </span>
                                    )}
                                  </span>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-2 text-center text-sm text-white">{item.quantity}</td>
                    <td className="p-2 text-right text-sm text-gray-400">
                      {Number(item.price).toFixed(2)} BYN
                    </td>
                    <td className="p-2 text-right text-sm text-white">
                      {(Number(item.price) * item.quantity).toFixed(2)} BYN
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10">
                <td colSpan={5} className="p-2 text-right text-sm text-gray-400">
                  Доставка:
                </td>
                <td className="p-2 text-right text-sm text-white">
                  {Number(order.deliveryPrice || 0).toFixed(2)} BYN
                </td>
              </tr>
              <tr>
                <td colSpan={5} className="p-2 text-right text-sm font-bold text-white">
                  Итого:
                </td>
                <td className="p-2 text-right text-sm font-bold text-[#ee862c]">
                  {Number(order.total).toFixed(2)} BYN
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <h2 className="font-heading text-lg font-bold text-white mb-4">Клиент</h2>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">ФИО</p>
              <p className="text-sm text-white">{order.customerName}</p>
            </div>
            {order.customerPhone && (
              <div>
                <p className="text-xs text-gray-500">
                  <FontAwesomeIcon icon={faPhone} className="mr-1" /> Телефон
                </p>
                <p className="text-sm text-white">{order.customerPhone}</p>
              </div>
            )}
            {order.customerEmail && (
              <div>
                <p className="text-xs text-gray-500">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-1" /> Email
                </p>
                <p className="text-sm text-white">{order.customerEmail}</p>
              </div>
            )}
            {order.address && (
              <div>
                <p className="text-xs text-gray-500">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1" /> Адрес
                </p>
                <p className="text-sm text-white">{order.address}</p>
              </div>
            )}
            {order.comment && (
              <div>
                <p className="text-xs text-gray-500">
                  <FontAwesomeIcon icon={faComment} className="mr-1" /> Комментарий
                </p>
                <p className="text-sm text-gray-300">{order.comment}</p>
              </div>
            )}
            <div className="pt-3 border-t border-white/10">
              <p className="text-xs text-gray-500">Статус</p>
              <OrderStatusBadge orderId={order.id} status={order.status} />
            </div>
            <div className="pt-3 border-t border-white/10">
              <p className="text-xs text-gray-500">
                <FontAwesomeIcon icon={faTruck} className="mr-1" /> Код отслеживания
              </p>
              <TrackingCodeInput orderId={order.id} trackingCode={order.trackingCode || ''} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Дата заказа</p>
              <p className="text-sm text-white">
                {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
