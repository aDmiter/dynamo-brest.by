/** Данные и HTML-шаблоны писем о заказе (стиль сайта Динамо-Брест). */

const BRAND = {
  bgMain: '#0d1117',
  bgCard: '#111820',
  bgHeader: '#242c41',
  accent: '#ee862c',
  textPrimary: '#1a1f2e',
  textMuted: '#5c6578',
  textOnDark: '#ffffff',
  textStat: '#a5b3d5',
  border: '#e2e6ef',
};

export interface OrderEmailItem {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  size?: string | null;
  imageUrl?: string | null;
  customizationNote?: string | null;
}

export interface OrderEmailData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  address: string | null;
  status: string;
  trackingCode?: string | null;
  itemsSubtotal: number;
  deliveryPrice: number;
  total: number;
  items: OrderEmailItem[];
}

export function getSiteBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://dynamo-brest.by';
  return url.replace(/\/$/, '');
}

export function getClubLogoUrl(): string {
  return `${getSiteBaseUrl()}/images/logos/logo-white.png`;
}

export function parseProductFirstImage(images: string | null | undefined): string | null {
  if (!images) return null;
  try {
    const parsed = JSON.parse(images) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const first = parsed[0];
    if (typeof first !== 'string' || !first.trim()) return null;
    if (first.startsWith('http://') || first.startsWith('https://')) return first;
    return `${getSiteBaseUrl()}${first.startsWith('/') ? first : `/${first}`}`;
  } catch {
    return null;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatMoney(amount: number): string {
  return `${amount.toFixed(2)} BYN`;
}

function parseCustomizationNote(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as {
      extraPrice?: number;
      playerName?: string;
      playerNumber?: string;
      type?: string;
    };
    const parts: string[] = [];
    if (data.type) parts.push(data.type);
    if (data.playerNumber != null && data.playerName) {
      parts.push(`#${data.playerNumber} ${data.playerName}`);
    }
    if (data.extraPrice && data.extraPrice > 0) {
      parts.push(`+${data.extraPrice.toFixed(2)} BYN`);
    }
    return parts.length > 0 ? parts.join(' · ') : null;
  } catch {
    return null;
  }
}

type PrismaOrderItem = {
  quantity: number;
  price: { toString(): string } | number;
  size: string | null;
  customization: string | null;
  product: { name: string; images: string | null };
};

type PrismaOrderLike = {
  id: string;
  orderNumber: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  address: string | null;
  status: string;
  trackingCode?: string | null;
  total: { toString(): string } | number;
  deliveryPrice: { toString(): string } | number | null;
  orderitem: PrismaOrderItem[];
};

export function mapOrderForEmail(order: PrismaOrderLike): OrderEmailData {
  const deliveryPrice = order.deliveryPrice != null ? Number(order.deliveryPrice) : 0;
  const total = Number(order.total);
  const items: OrderEmailItem[] = order.orderitem.map((item) => {
    const unitPrice = Number(item.price);
    return {
      name: item.product.name,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
      size: item.size,
      imageUrl: parseProductFirstImage(item.product.images),
      customizationNote: parseCustomizationNote(item.customization),
    };
  });
  const itemsSubtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);

  return {
    id: order.id,
    orderNumber: order.orderNumber || order.id.slice(-6),
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    address: order.address,
    status: order.status,
    trackingCode: order.trackingCode,
    itemsSubtotal,
    deliveryPrice,
    total: total > 0 ? total : itemsSubtotal + deliveryPrice,
    items,
  };
}

function emailShell(content: string, preheader: string): string {
  const logoUrl = getClubLogoUrl();
  const siteUrl = getSiteBaseUrl();

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Динамо-Брест</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bgMain};font-family:'Segoe UI',Roboto,Arial,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${BRAND.bgMain};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;">
          <tr>
            <td style="background:${BRAND.bgHeader};border-radius:12px 12px 0 0;padding:28px 24px;text-align:center;">
              <a href="${siteUrl}" style="text-decoration:none;">
                <img src="${logoUrl}" alt="ФК «Динамо-Брест»" width="160" style="display:block;margin:0 auto 16px;max-width:160px;height:auto;border:0;" />
              </a>
              <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.28em;text-transform:uppercase;color:${BRAND.accent};">Интернет-магазин</p>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border-radius:0 0 12px 12px;padding:32px 28px;color:${BRAND.textPrimary};">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 8px 8px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:${BRAND.textStat};">
                <a href="${siteUrl}" style="color:${BRAND.accent};text-decoration:none;">dynamo-brest.by</a>
              </p>
              <p style="margin:0;font-size:11px;color:rgba(165,179,213,0.7);">ФК «Динамо-Брест» · Республика Беларусь</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderOrderItems(order: OrderEmailData): string {
  if (order.items.length === 0) {
    return `<p style="margin:0;color:${BRAND.textMuted};">Состав заказа уточняется.</p>`;
  }

  return order.items
    .map((item) => {
      const imageCell = item.imageUrl
        ? `<img src="${item.imageUrl}" alt="" width="72" height="72" style="display:block;width:72px;height:72px;object-fit:cover;border-radius:8px;border:1px solid ${BRAND.border};" />`
        : `<div style="display:block;width:72px;height:72px;background:${BRAND.border};border-radius:8px;"></div>`;

      const metaParts = [
        item.size ? `Размер: ${escapeHtml(item.size)}` : null,
        item.customizationNote ? escapeHtml(item.customizationNote) : null,
      ].filter(Boolean);

      return `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px;border:1px solid ${BRAND.border};border-radius:10px;overflow:hidden;">
        <tr>
          <td width="88" style="padding:12px;vertical-align:top;background:#f8f9fc;">${imageCell}</td>
          <td style="padding:14px 16px;vertical-align:top;">
            <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:${BRAND.textPrimary};line-height:1.35;">${escapeHtml(item.name)}</p>
            ${metaParts.length ? `<p style="margin:0 0 10px;font-size:12px;color:${BRAND.textMuted};line-height:1.5;">${metaParts.join('<br />')}</p>` : ''}
            <p style="margin:0;font-size:13px;color:${BRAND.textMuted};">${item.quantity} × ${formatMoney(item.unitPrice)}</p>
          </td>
          <td style="padding:14px 16px;vertical-align:top;text-align:right;white-space:nowrap;">
            <p style="margin:0;font-size:15px;font-weight:700;color:${BRAND.textPrimary};">${formatMoney(item.lineTotal)}</p>
          </td>
        </tr>
      </table>`;
    })
    .join('');
}

function renderTotals(order: OrderEmailData): string {
  const deliveryLabel =
    order.deliveryPrice > 0 ? formatMoney(order.deliveryPrice) : 'Бесплатно';

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;border-top:2px solid ${BRAND.border};">
      <tr>
        <td style="padding:14px 0 6px;font-size:14px;color:${BRAND.textMuted};">Товары</td>
        <td style="padding:14px 0 6px;font-size:14px;text-align:right;color:${BRAND.textPrimary};">${formatMoney(order.itemsSubtotal)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:14px;color:${BRAND.textMuted};">Доставка</td>
        <td style="padding:6px 0;font-size:14px;text-align:right;color:${BRAND.textPrimary};">${deliveryLabel}</td>
      </tr>
      <tr>
        <td style="padding:14px 0 4px;font-size:16px;font-weight:700;color:${BRAND.textPrimary};">Итого</td>
        <td style="padding:14px 0 4px;font-size:18px;font-weight:800;text-align:right;color:${BRAND.accent};">${formatMoney(order.total)}</td>
      </tr>
    </table>`;
}

function renderOrderMeta(order: OrderEmailData): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 24px;background:#f8f9fc;border-radius:10px;border:1px solid ${BRAND.border};">
      <tr>
        <td style="padding:16px 18px;">
          <p style="margin:0 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:${BRAND.textMuted};">Номер заказа</p>
          <p style="margin:0 0 14px;font-size:22px;font-weight:800;color:${BRAND.textPrimary};">№${escapeHtml(order.orderNumber)}</p>
          ${order.address ? `<p style="margin:0 0 4px;font-size:13px;color:${BRAND.textMuted};"><strong style="color:${BRAND.textPrimary};">Адрес:</strong> ${escapeHtml(order.address)}</p>` : ''}
          ${order.customerPhone ? `<p style="margin:0;font-size:13px;color:${BRAND.textMuted};"><strong style="color:${BRAND.textPrimary};">Телефон:</strong> ${escapeHtml(order.customerPhone)}</p>` : ''}
        </td>
      </tr>
    </table>`;
}

export function buildCustomerNewOrderEmail(order: OrderEmailData): { html: string; preheader: string } {
  const preheader = `Заказ №${order.orderNumber} принят. Итого ${formatMoney(order.total)}.`;

  const content = `
    <p style="margin:0 0 8px;font-size:16px;line-height:1.6;color:${BRAND.textPrimary};">Здравствуйте, <strong>${escapeHtml(order.customerName)}</strong>!</p>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${BRAND.textMuted};">Спасибо за заказ в интернет-магазине ФК «Динамо-Брест». Мы получили вашу заявку и передали её в обработку.</p>
    ${renderOrderMeta(order)}
    <h2 style="margin:0 0 16px;font-size:13px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.textPrimary};">Состав заказа</h2>
    ${renderOrderItems(order)}
    ${renderTotals(order)}
    <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:${BRAND.textMuted};">Если у вас есть вопросы по заказу, ответьте на это письмо или свяжитесь с нами через сайт.</p>
  `;

  return { html: emailShell(content, preheader), preheader };
}

export function buildCustomerStatusEmail(
  order: OrderEmailData,
  statusLabel: string,
  newStatus: string
): { html: string; preheader: string } {
  const preheader = `Статус заказа №${order.orderNumber}: ${statusLabel}.`;

  const trackingBlock =
    newStatus === 'shipped' && order.trackingCode
      ? `
    <div style="margin:0 0 24px;padding:16px 18px;background:#fff8f0;border:1px solid rgba(238,134,44,0.35);border-radius:10px;">
      <p style="margin:0 0 6px;font-size:13px;color:${BRAND.textMuted};">Код отслеживания</p>
      <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:${BRAND.textPrimary};">${escapeHtml(order.trackingCode)}</p>
      <p style="margin:0;font-size:13px;"><a href="https://belpost.by" style="color:${BRAND.accent};">Отследить на belpost.by</a></p>
    </div>`
      : '';

  const content = `
    <p style="margin:0 0 8px;font-size:16px;line-height:1.6;color:${BRAND.textPrimary};">Здравствуйте, <strong>${escapeHtml(order.customerName)}</strong>!</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${BRAND.textMuted};">Статус вашего заказа обновлён:</p>
    <div style="margin:0 0 24px;padding:18px;text-align:center;background:${BRAND.bgHeader};border-radius:10px;">
      <p style="margin:0;font-size:20px;font-weight:800;color:${BRAND.accent};">${escapeHtml(statusLabel)}</p>
      <p style="margin:8px 0 0;font-size:13px;color:${BRAND.textStat};">Заказ №${escapeHtml(order.orderNumber)}</p>
    </div>
    ${trackingBlock}
    <h2 style="margin:0 0 16px;font-size:13px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.textPrimary};">Ваш заказ</h2>
    ${renderOrderItems(order)}
    ${renderTotals(order)}
  `;

  return { html: emailShell(content, preheader), preheader };
}

export function buildAdminNewOrderEmail(order: OrderEmailData): string {
  const content = `
    <h2 style="margin:0 0 16px;font-size:18px;color:${BRAND.textPrimary};">Новый заказ №${escapeHtml(order.orderNumber)}</h2>
    <p style="margin:0 0 6px;font-size:14px;"><strong>Клиент:</strong> ${escapeHtml(order.customerName)}</p>
    <p style="margin:0 0 6px;font-size:14px;"><strong>Телефон:</strong> ${escapeHtml(order.customerPhone)}</p>
    <p style="margin:0 0 6px;font-size:14px;"><strong>Email:</strong> ${escapeHtml(order.customerEmail || '—')}</p>
    <p style="margin:0 0 20px;font-size:14px;"><strong>Адрес:</strong> ${escapeHtml(order.address || '—')}</p>
    ${renderOrderItems(order)}
    ${renderTotals(order)}
  `;
  return emailShell(content, `Новый заказ ${order.orderNumber}`);
}
