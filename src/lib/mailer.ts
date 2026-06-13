// src/lib/mailer.ts
import {
  buildAdminNewOrderEmail,
  buildAdminStatusEmail,
  buildCustomerNewOrderEmail,
  buildCustomerStatusEmail,
  mapOrderForEmail,
  type OrderEmailData,
} from '@/lib/order-email';
import { createMailTransporter, getMailFrom } from '@/lib/mail-config';

const statusLabels: Record<string, string> = {
  received: 'Получен',
  processing: 'В обработке',
  paid: 'Оплачен',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

function getTransporter() {
  return createMailTransporter();
}

export async function sendNewOrderEmail(order: OrderEmailData) {
  const { html } = buildCustomerNewOrderEmail(order);
  const from = getMailFrom();

  if (order.customerEmail) {
    try {
      await getTransporter().sendMail({
        from,
        to: order.customerEmail,
        subject: `Заказ №${order.orderNumber} принят`,
        html,
      });
      console.log(`✅ Письмо клиенту отправлено: ${order.customerEmail}`);
    } catch (e) {
      console.error('❌ Ошибка отправки письма клиенту:', e);
    }
  }

  if (process.env.ADMIN_EMAIL) {
    try {
      await getTransporter().sendMail({
        from,
        to: process.env.ADMIN_EMAIL,
        subject: `Новый заказ №${order.orderNumber} — ${order.customerName}`,
        html: buildAdminNewOrderEmail(order),
      });
      console.log(`✅ Письмо админу отправлено: ${process.env.ADMIN_EMAIL}`);
    } catch (e) {
      console.error('❌ Ошибка отправки письма админу:', e);
    }
  }
}

export async function sendStatusUpdateEmail(order: OrderEmailData, newStatus: string) {
  const statusLabel = statusLabels[newStatus] || newStatus;
  const from = getMailFrom();
  let customerHtml: string | null = null;
  try {
    customerHtml = buildCustomerStatusEmail(order, statusLabel, newStatus).html;
  } catch (e) {
    console.error('❌ Шаблон письма клиенту (статус):', e);
  }

  if (order.customerEmail && customerHtml) {
    try {
      await getTransporter().sendMail({
        from,
        to: order.customerEmail,
        subject: `Заказ №${order.orderNumber} — ${statusLabel}`,
        html: customerHtml,
      });
      console.log(`✅ Письмо о смене статуса отправлено: ${order.customerEmail}`);
    } catch (e) {
      console.error('❌ Ошибка письма клиенту (статус):', e);
    }
  }

  if (process.env.ADMIN_EMAIL) {
    try {
      await getTransporter().sendMail({
        from,
        to: process.env.ADMIN_EMAIL,
        subject: `Заказ №${order.orderNumber} — ${statusLabel}`,
        html: buildAdminStatusEmail(order, statusLabel, newStatus),
      });
      console.log(`✅ Письмо админу (статус): ${process.env.ADMIN_EMAIL}`);
    } catch (e) {
      console.error('❌ Ошибка письма админу (статус):', e);
    }
  }
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
