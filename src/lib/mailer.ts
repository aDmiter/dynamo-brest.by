// src/lib/mailer.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'divid.joomlin@gmail.com',
    pass: 'tbckytarhjtnjjkg',
  },
});

interface OrderItem {
  product: { name: string };
  quantity: number;
  price: number;
  size?: string | null;
}

interface Order {
  id: string;
  orderNumber: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  address: string | null;
  total: number;
  status: string;
  trackingCode?: string | null;
  deliveryPrice?: number | null;
  orderitem: OrderItem[];
}

const statusLabels: Record<string, string> = {
  received: 'Получен',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

function getOrderItemsHtml(items: OrderItem[]): string {
  if (!items.length) return '<tr><td colspan="3">Нет товаров</td></tr>';

  return items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #2a3045;">
      <td style="padding: 12px 8px;">
        ${item.product.name}
        ${item.size ? `<br><small style="color: #a5b3d5;">Размер: ${item.size}</small>` : ''}
      </td>
      <td style="padding: 12px 8px; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 8px; text-align: right;">${item.price.toFixed(2)} BYN</td>
    </tr>
  `
    )
    .join('');
}

export async function sendNewOrderEmail(order: Order) {
  const orderNum = order.orderNumber || order.id.slice(-6);
  const subtotal = order.total;
  const deliveryPrice = order.deliveryPrice || 0;
  const totalWithDelivery = subtotal + deliveryPrice;

  // Письмо клиенту
  if (order.customerEmail) {
    const customerHtml = `
      <div style="max-width: 500px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: #242C41; padding: 20px; text-align: center;">
          <h2 style="color: #ee862c; margin: 0;">Динамо-Брест</h2>
        </div>
        <div style="padding: 20px;">
          <p>Здравствуйте, <strong>${order.customerName}</strong>!</p>
          <p>Ваш заказ <strong>№${orderNum}</strong> принят и передан в обработку.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #242C41; color: white;">
                <th style="padding: 10px; text-align: left;">Товар</th>
                <th style="padding: 10px; text-align: center;">Кол-во</th>
                <th style="padding: 10px; text-align: right;">Цена</th>
               </tr>
            </thead>
            <tbody>${getOrderItemsHtml(order.orderitem)}</tbody>
            <tfoot>
              <tr><td colspan="2" style="padding: 8px; text-align: right;">Сумма:</td><td style="text-align: right;">${subtotal.toFixed(2)} BYN</td></tr>
              <tr><td colspan="2" style="padding: 8px; text-align: right;">Доставка:</td><td style="text-align: right;">${deliveryPrice.toFixed(2)} BYN</td></tr>
              <tr style="font-weight: bold;"><td colspan="2" style="padding: 8px; text-align: right;">Итого:</td><td style="text-align: right; color: #ee862c;">${totalWithDelivery.toFixed(2)} BYN</td></tr>
            </tfoot>
          </table>
          
          <p>Спасибо за покупку!</p>
          <hr>
          <p style="font-size: 12px; color: #999;">ФК «Динамо-Брест» | dynamo-brest.by</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: 'Динамо-Брест <divid.joomlin@gmail.com>',
      to: order.customerEmail,
      subject: `✅ Заказ ${orderNum} принят!`,
      html: customerHtml,
    });
    console.log(`✅ Письмо клиенту отправлено: ${order.customerEmail}`);
  }

  // Письмо админу
  if (process.env.ADMIN_EMAIL) {
    const adminHtml = `
      <div style="max-width: 500px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h2 style="color: #ee862c;">🛍 НОВЫЙ ЗАКАЗ ${orderNum}</h2>
        <p><strong>Клиент:</strong> ${order.customerName}</p>
        <p><strong>Телефон:</strong> ${order.customerPhone}</p>
        <p><strong>Email:</strong> ${order.customerEmail || '—'}</p>
        <p><strong>Адрес:</strong> ${order.address || '—'}</p>
        <hr>
        <p><strong>Сумма:</strong> ${totalWithDelivery.toFixed(2)} BYN</p>
        <table style="width: 100%; border-collapse: collapse;">${getOrderItemsHtml(order.orderitem)}</table>
      </div>
    `;

    await transporter.sendMail({
      from: 'Динамо-Брест <divid.joomlin@gmail.com>',
      to: process.env.ADMIN_EMAIL,
      subject: `🛍 Новый заказ ${orderNum} — ${order.customerName}`,
      html: adminHtml,
    });
    console.log(`✅ Письмо админу отправлено: ${process.env.ADMIN_EMAIL}`);
  }
}

export async function sendStatusUpdateEmail(order: Order, newStatus: string) {
  const orderNum = order.orderNumber || order.id.slice(-6);
  const statusLabel = statusLabels[newStatus] || newStatus;

  if (!order.customerEmail) return;

  const html = `
    <div style="max-width: 500px; margin: 0 auto; font-family: Arial, sans-serif;">
      <div style="background: #242C41; padding: 20px; text-align: center;">
        <h2 style="color: #ee862c; margin: 0;">Динамо-Брест</h2>
      </div>
      <div style="padding: 20px;">
        <p>Здравствуйте, <strong>${order.customerName}</strong>!</p>
        <p>Статус вашего заказа <strong>№${orderNum}</strong> изменён на:</p>
        <div style="background: #f0f0f0; padding: 15px; text-align: center; font-size: 20px; font-weight: bold; color: #ee862c;">
          ${statusLabel}
        </div>
        ${
          newStatus === 'shipped' && order.trackingCode
            ? `
          <p><strong>Код отслеживания:</strong> ${order.trackingCode}</p>
          <p>Отследить: <a href="https://belpost.by">belpost.by</a></p>
        `
            : ''
        }
        <hr>
        <p style="font-size: 12px; color: #999;">ФК «Динамо-Брест» | dynamo-brest.by</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: 'Динамо-Брест <divid.joomlin@gmail.com>',
    to: order.customerEmail,
    subject: `🔄 Статус заказа ${orderNum} изменён — ${statusLabel}`,
    html,
  });
  console.log(`✅ Письмо о смене статуса отправлено: ${order.customerEmail}`);
}

// Универсальная функция для совместимости
export async function sendOrderEmails(order: Order, newStatus?: string) {
  if (newStatus) {
    await sendStatusUpdateEmail(order, newStatus);
  } else {
    await sendNewOrderEmail(order);
  }
}
