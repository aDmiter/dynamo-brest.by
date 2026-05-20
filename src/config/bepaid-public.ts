/** Публичные URL bePaid (безопасно для client components). */
export const BEPAID_CHECKOUT_URL = 'https://checkout.bepaid.by';
export const BEPAID_WIDGET_SCRIPT = 'https://js.bepaid.by/widget/be_gateway.js';

export const BEPAID_MOCK_TOKEN_PREFIX = 'mock:';

export function isBePaidMockToken(token: string): boolean {
  return token.startsWith(BEPAID_MOCK_TOKEN_PREFIX);
}
