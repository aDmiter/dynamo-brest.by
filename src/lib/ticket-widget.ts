/** Ссылки saleframe.* открываются виджетом afp.js в модальном окне на сайте. */
export function isSaleframeTicketUrl(url: string): boolean {
  if (!url?.trim()) return false;
  try {
    return new URL(url.trim()).hostname.includes('saleframe.');
  } catch {
    return url.includes('//saleframe.');
  }
}

/**
 * @param saleframeModalAllowed — false на localhost: CSP saleframe не пускает iframe
 */
export function getTicketLinkProps(
  href: string,
  saleframeModalAllowed = true,
): { target?: '_blank'; rel?: string } {
  if (isSaleframeTicketUrl(href)) {
    if (saleframeModalAllowed) {
      return {};
    }
    return { target: '_blank', rel: 'noopener noreferrer' };
  }
  return { target: '_blank', rel: 'noopener noreferrer' };
}
