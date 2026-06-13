export const ORDER_STATUS_OPTIONS = [
  { value: 'unpaid', label: 'Не оплачен', color: 'text-yellow-400 bg-yellow-400/10' },
  { value: 'paid', label: 'Оплачен', color: 'text-green-400 bg-green-400/10' },
  { value: 'shipped', label: 'Отправлен', color: 'text-purple-400 bg-purple-400/10' },
  { value: 'delivered', label: 'Доставлен', color: 'text-blue-400 bg-blue-400/10' },
  { value: 'cancelled', label: 'Отменён', color: 'text-red-400 bg-red-400/10' },
] as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  unpaid: 'Не оплачен',
  pending_payment: 'Не оплачен',
  paid: 'Оплачен',
  received: 'Получен',
  new: 'Новый',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  unpaid: 'text-yellow-400 bg-yellow-400/10',
  pending_payment: 'text-yellow-400 bg-yellow-400/10',
  paid: 'text-green-400 bg-green-400/10',
  received: 'text-gray-400 bg-gray-400/10',
  new: 'text-gray-400 bg-gray-400/10',
  shipped: 'text-purple-400 bg-purple-400/10',
  delivered: 'text-blue-400 bg-blue-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
};

/** Старый статус ожидания оплаты → единый «Не оплачен». */
export function normalizeOrderStatus(status: string): string {
  if (status === 'pending_payment') return 'unpaid';
  return status;
}

export function isUnpaidOrderStatus(status: string): boolean {
  const normalized = normalizeOrderStatus(status);
  return normalized === 'unpaid';
}

export function isPaidOrderStatus(status: string): boolean {
  return status === 'paid' || status === 'received';
}
