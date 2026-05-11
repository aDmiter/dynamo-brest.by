// src/lib/mailer.ts - Отправка email уведомлений
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface OrderItem {
  product: { name: string };
  quantity: number;
  price: { toString: () => string };
}

interface Order {
  id: string;
  orderNumber: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  address: string | null;
  total: { toString: () => string };
  status: string;
  trackingCode?: string | null;
  orderitem: OrderItem[];
}

const statusLabels: Record<string, string> = {
  received: 'Получен',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

function getOrderItemsHtml(order: Order): string {
  return order.orderitem
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${item.product.name}</td>
          <td style="padding:8px;text-align:center;border-bottom:1px solid #eee">${item.quantity}</td>
          <td style="padding:8px;text-align:right;border-bottom:1px solid #eee">${Number(item.price).toFixed(2)} BYN</td>
        </tr>`
    )
    .join('');
}

function getTrackingHtml(order: Order): string {
  if (!order.trackingCode) return '';
  return `
    <div style="margin:20px 0;padding:15px;background:#f5f5f5;border-radius:4px">
      <p style="margin:0;font-size:14px"><strong>Код отслеживания:</strong> <span style="color:#ee862c;font-size:16px">${order.trackingCode}</span></p>
      <p style="margin:5px 0 0;font-size:12px;color:#666">Отследить посылку можно на сайте <a href="https://belpost.by" style="color:#ee862c">Белпочты</a></p>
    </div>
  `;
}

export async function sendOrderEmails(order: Order, newStatus?: string) {
  const orderNum = order.orderNumber || '—';
  const statusLabel = newStatus ? statusLabels[newStatus] || newStatus : null;

  try {
    // Письмо клиенту
    if (order.customerEmail) {
      let subject: string;
      let html: string;

      if (statusLabel) {
        // Уведомление о смене статуса
        subject = `Статус заказа ${orderNum} изменён — ${statusLabel}`;
        html = `
          <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
            <h1 style="color:#003366">Динамо-Брест</h1>
            <h2>Статус заказа ${orderNum}: ${statusLabel}</h2>
            <p>Здравствуйте, ${order.customerName}!</p>
            ${statusLabel === 'Отправлен' && order.trackingCode ? getTrackingHtml(order) : ''}
            ${statusLabel === 'Отменён' ? '<p>Ваш заказ был отменён. Если у вас есть вопросы, свяжитесь с нами.</p>' : ''}
            ${statusLabel === 'Доставлен' ? '<p>Ваш заказ доставлен! Спасибо за покупку!</p>' : ''}
            <hr style="border:1px solid #eee;margin:20px 0" />
            <p style="color:#999;font-size:12px">ФК «Динамо-Брест» | dynamo-brest.by</p>
          </div>
        `;
      } else {
        // Подтверждение заказа
        subject = `Заказ ${orderNum} принят — Динамо-Брест`;
        html = `
          <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
            <h1 style="color:#003366">Динамо-Брест</h1>
            <h2>Заказ ${orderNum} принят!</h2>
            <p>Спасибо за заказ, ${order.customerName}!</p>
            <table style="width:100%;border-collapse:collapse;margin:20px 0">
              <thead><tr style="background:#003366;color:white"><th style="padding:8px;text-align:left">Товар</th><th style="padding:8px;text-align:center">Кол-во</th><th style="padding:8px;text-align:right">Цена</th></tr></thead>
              <tbody>${getOrderItemsHtml(order)}</tbody>
              <tfoot><tr><td colspan="2" style="padding:8px;text-align:right;font-weight:bold">Итого:</td><td style="padding:8px;text-align:right;font-weight:bold;color:#ee862c">${Number(order.total).toFixed(2)} BYN</td></tr></tfoot>
            </table>
            <p>Со статусом заказа и кодом отслеживания доставки можно будет ознакомиться в личном кабинете.</p>
            <hr style="border:1px solid #eee;margin:20px 0" />
            <p style="color:#999;font-size:12px">ФК «Динамо-Брест» | dynamo-brest.by</p>
          </div>
        `;
      }

      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: order.customerEmail,
        subject,
        html,
      });
    }

    // Письмо админу
    const adminSubject = statusLabel
      ? `Статус заказа ${orderNum} изменён на "${statusLabel}" — ${order.customerName}`
      : `Новый заказ ${orderNum} — ${order.customerName}`;

    const adminHtml = `
      <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif">
        <h2>${statusLabel ? `Статус изменён: ${statusLabel}` : 'Новый заказ'} ${orderNum}</h2>
        <p><strong>Клиент:</strong> ${order.customerName}</p>
        <p><strong>Телефон:</strong> ${order.customerPhone}</p>
        <p><strong>Email:</strong> ${order.customerEmail || '—'}</p>
        <p><strong>Адрес:</strong> ${order.address || '—'}</p>
        ${order.trackingCode ? `<p><strong>Трекинг:</strong> ${order.trackingCode}</p>` : ''}
        <table style="width:100%;border-collapse:collapse;margin:20px 0">${getOrderItemsHtml(order)}</table>
        <p style="font-size:18px"><strong>Итого: ${Number(order.total).toFixed(2)} BYN</strong></p>
      </div>
    `;

    if (process.env.ADMIN_EMAIL) {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: process.env.ADMIN_EMAIL,
        subject: adminSubject,
        html: adminHtml,
      });
    }

    console.log(
      `Письма отправлены для заказа ${orderNum}${statusLabel ? ` (статус: ${statusLabel})` : ''}`
    );
  } catch (error) {
    console.error('Ошибка отправки писем:', error);
  }
}
