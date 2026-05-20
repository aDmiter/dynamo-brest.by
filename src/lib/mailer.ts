// src/lib/mailer.ts
import nodemailer from 'nodemailer';
import {
  buildAdminNewOrderEmail,
  buildCustomerNewOrderEmail,
  buildCustomerStatusEmail,
  mapOrderForEmail,
  type OrderEmailData,
} from '@/lib/order-email';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'divid.joomlin@gmail.com',
    pass: 'tbckytarhjtnjjkg',
  },
});

const statusLabels: Record<string, string> = {
  received: 'Получен',
  processing: 'В обработке',
  paid: 'Оплачен',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

export async function sendNewOrderEmail(order: OrderEmailData) {
  const { html } = buildCustomerNewOrderEmail(order);

  if (order.customerEmail) {
    await transporter.sendMail({
      from: 'Динамо-Брест <divid.joomlin@gmail.com>',
      to: order.customerEmail,
      subject: `Заказ №${order.orderNumber} принят`,
      html,
    });
    console.log(`✅ Письмо клиенту отправлено: ${order.customerEmail}`);
  }

  if (process.env.ADMIN_EMAIL) {
    await transporter.sendMail({
      from: 'Динамо-Брест <divid.joomlin@gmail.com>',
      to: process.env.ADMIN_EMAIL,
      subject: `Новый заказ №${order.orderNumber} — ${order.customerName}`,
      html: buildAdminNewOrderEmail(order),
    });
    console.log(`✅ Письмо админу отправлено: ${process.env.ADMIN_EMAIL}`);
  }
}

export async function sendStatusUpdateEmail(order: OrderEmailData, newStatus: string) {
  if (!order.customerEmail) return;

  const statusLabel = statusLabels[newStatus] || newStatus;
  const { html } = buildCustomerStatusEmail(order, statusLabel, newStatus);

  await transporter.sendMail({
    from: 'Динамо-Брест <divid.joomlin@gmail.com>',
    to: order.customerEmail,
    subject: `Заказ №${order.orderNumber} — ${statusLabel}`,
    html,
  });
  console.log(`✅ Письмо о смене статуса отправлено: ${order.customerEmail}`);
}

export async function sendOrderEmails(
  order: Parameters<typeof mapOrderForEmail>[0],
  newStatus?: string
) {
  const emailData = mapOrderForEmail(order);
  if (newStatus) {
    await sendStatusUpdateEmail(emailData, newStatus);
  } else {
    await sendNewOrderEmail(emailData);
  }
}
