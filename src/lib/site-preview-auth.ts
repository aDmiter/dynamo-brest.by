import { SITE_PREVIEW_COOKIE } from '@/lib/site-preview';

const TOKEN_TTL_SEC = 60 * 60 * 24 * 90;

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET не задан');
  }
  return new TextEncoder().encode(secret);
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const binary = atob(padded + '='.repeat(padLen));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', secretKey(), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

export async function createSitePreviewToken(userId: string): Promise<string> {
  const header = base64UrlEncode(new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify({ uid: userId, iat: now, exp: now + TOKEN_TTL_SEC }))
  );
  const data = `${header}.${payload}`;
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(), new TextEncoder().encode(data));
  return `${data}.${base64UrlEncode(new Uint8Array(sig))}`;
}

export async function verifySitePreviewToken(token: string): Promise<string | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const data = `${header}.${payload}`;

  try {
    const valid = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(),
      base64UrlDecode(signature),
      new TextEncoder().encode(data)
    );
    if (!valid) return null;

    const json = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload))) as {
      uid?: string;
      exp?: number;
    };
    if (json.exp && json.exp < Math.floor(Date.now() / 1000)) return null;
    return typeof json.uid === 'string' ? json.uid : null;
  } catch {
    return null;
  }
}

function useSecureCookies(): boolean {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.AUTH_URL ?? '').trim();
  return siteUrl.startsWith('https://');
}

export function previewSessionCookieOptions(maxAgeSec = TOKEN_TTL_SEC) {
  return {
    name: SITE_PREVIEW_COOKIE,
    httpOnly: true as const,
    secure: useSecureCookies(),
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSec,
  };
}
