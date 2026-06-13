import https from 'node:https';
import { prisma } from '@/lib/prisma';

export const BELPOST_PARCEL_URL = 'https://tarifikator.belpost.by/forms/international/parcel.php';

const FORM_DEFAULTS = {
  who: 'ur',
  priority: 'yes',
  type: 'simple',
  weight: '1',
} as const;

const REQUEST_DELAY_MS = 150;
const REQUEST_TIMEOUT_MS = 15_000;

/** Один Agent на все запросы — быстрее и меньше нагрузка на SSL. */
const belpostHttpsAgent = new https.Agent({
  rejectUnauthorized: false,
  keepAlive: true,
  maxSockets: 4,
});

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
  total?: number;
  processed?: number;
  nextOffset?: number | null;
  done?: boolean;
}

export interface BelpostSyncOptions {
  offset?: number;
  limit?: number;
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
  const bodyStr = body.toString();
  const url = new URL(BELPOST_PARCEL_URL);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: url.hostname,
        path: `${url.pathname}${url.search}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(bodyStr),
          'User-Agent': 'Mozilla/5.0 (compatible; dynamo-brest-belpost-sync/1.0)',
        },
        // У tarifikator.belpost.by неполная цепочка SSL — Node fetch/curl ведут себя по-разному.
        rejectUnauthorized: false,
        agent: belpostHttpsAgent,
        timeout: REQUEST_TIMEOUT_MS,
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode} от tarifikator.belpost.by`));
            return;
          }
          resolve(data);
        });
      }
    );

    req.on('error', (error) => {
      reject(error instanceof Error ? error : new Error(String(error)));
    });
    req.on('timeout', () => {
      req.destroy(new Error('Таймаут запроса к tarifikator.belpost.by'));
    });

    req.write(bodyStr);
    req.end();
  });
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function syncBelpostCountryPrices(
  options: BelpostSyncOptions = {}
): Promise<BelpostSyncSummary> {
  const countries = await prisma.country.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  });

  const offset = Math.max(0, options.offset ?? 0);
  const limit =
    options.limit === undefined || options.limit === null
      ? countries.length
      : Math.max(1, options.limit);
  const batch = countries.slice(offset, offset + limit);
  const items: BelpostSyncItemResult[] = [];

  for (const country of batch) {
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

  const nextOffset = offset + batch.length;
  const done = nextOffset >= countries.length;

  return {
    updated: items.filter((i) => i.status === 'updated').length,
    unavailable: items.filter((i) => i.status === 'unavailable').length,
    skipped: items.filter((i) => i.status === 'skipped').length,
    errors: items.filter((i) => i.status === 'error').length,
    items,
    total: countries.length,
    processed: nextOffset,
    nextOffset: done ? null : nextOffset,
    done,
  };
}
