import { execFileSync } from 'child_process';
import { prisma } from '@/lib/prisma';

export const BELPOST_PARCEL_URL = 'https://tarifikator.belpost.by/forms/international/parcel.php';

const FORM_DEFAULTS = {
  who: 'ur',
  priority: 'yes',
  type: 'simple',
  weight: '1',
} as const;

const REQUEST_DELAY_MS = 300;

export type BelpostSyncItemStatus = 'updated' | 'unavailable' | 'skipped' | 'error';

export interface BelpostSyncItemResult {
  code: string;
  name: string;
  status: BelpostSyncItemStatus;
  rawPrice?: number;
  price?: number;
  message?: string;
}

export interface BelpostSyncSummary {
  updated: number;
  unavailable: number;
  skipped: number;
  errors: number;
  items: BelpostSyncItemResult[];
}

/** Округление вверх до десятков + 20 BYN. */
export function adjustBelpostDeliveryPrice(rawPrice: number): number {
  return Math.ceil(rawPrice / 10) * 10 + 20;
}

export function parseBelpostRawPrice(html: string): number | null {
  const m = html.match(/<h1>\s*Сумма:\s*(\d+)\s*руб\.?\s*(\d+)\s*коп/i);
  if (!m) return null;
  return parseInt(m[1], 10) + parseInt(m[2], 10) / 100;
}

export function isBelpostShippingUnavailable(html: string): boolean {
  return /Отправка не осуществляется/i.test(html);
}

async function fetchBelpostHtml(countryCode: string): Promise<string> {
  const body = new URLSearchParams(FORM_DEFAULTS);
  body.set('to', countryCode);

  try {
    const res = await fetch(BELPOST_PARCEL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (compatible; dynamo-brest-belpost-sync/1.0)',
      },
      body: body.toString(),
      signal: AbortSignal.timeout(25_000),
    });
    if (res.ok) return await res.text();
  } catch {
    /* fallback curl */
  }

  const curlBin = process.platform === 'win32' ? 'curl.exe' : 'curl';
  return execFileSync(
    curlBin,
    ['-sL', '-A', 'Mozilla/5.0', '-X', 'POST', BELPOST_PARCEL_URL, '--data', body.toString()],
    { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 }
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function syncBelpostCountryPrices(): Promise<BelpostSyncSummary> {
  const countries = await prisma.country.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  });

  const items: BelpostSyncItemResult[] = [];

  for (const country of countries) {
    if (country.code === 'BY') {
      items.push({
        code: country.code,
        name: country.name,
        status: 'skipped',
        message: 'Не изменяется при синхронизации',
      });
      continue;
    }

    try {
      const html = await fetchBelpostHtml(country.code);

      if (isBelpostShippingUnavailable(html)) {
        await prisma.country.update({
          where: { id: country.id },
          data: { price: null, isActive: false },
        });
        items.push({
          code: country.code,
          name: country.name,
          status: 'unavailable',
          message: 'Отправка не осуществляется (Belpost)',
        });
      } else {
        const rawPrice = parseBelpostRawPrice(html);
        if (rawPrice === null) {
          items.push({
            code: country.code,
            name: country.name,
            status: 'error',
            message: 'Не удалось разобрать ответ тарификатора',
          });
        } else {
          const price = adjustBelpostDeliveryPrice(rawPrice);
          await prisma.country.update({
            where: { id: country.id },
            data: { price, isActive: true },
          });
          items.push({
            code: country.code,
            name: country.name,
            status: 'updated',
            rawPrice,
            price,
          });
        }
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ошибка запроса';
      items.push({
        code: country.code,
        name: country.name,
        status: 'error',
        message,
      });
    }

    await sleep(REQUEST_DELAY_MS);
  }

  return {
    updated: items.filter((i) => i.status === 'updated').length,
    unavailable: items.filter((i) => i.status === 'unavailable').length,
    skipped: items.filter((i) => i.status === 'skipped').length,
    errors: items.filter((i) => i.status === 'error').length,
    items,
  };
}
