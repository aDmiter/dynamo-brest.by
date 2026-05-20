/**
 * Встраивание saleframe в iframe разрешено только с доменов из CSP frame-ancestors
 * (например dynamo-brest.by). На localhost / 127.0.0.1 / ::1 iframe блокируется — открываем в новой вкладке.
 */
export function isTicketSaleframeModalSupportedHost(hostHeader: string | null | undefined): boolean {
  if (!hostHeader) return true;
  const h = hostHeader.trim().toLowerCase();

  if (h.includes('localhost')) return false;
  if (h.startsWith('127.0.0.1') || h.includes('127.0.0.1')) return false;
  if (h.startsWith('[::1]') || h === '::1' || h.startsWith('0.0.0.0')) return false;

  return true;
}
