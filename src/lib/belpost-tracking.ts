const BELPOST_TRACKING_URL = 'https://api.belpost.by/api/v1/tracking';

export interface BelpostTrackingStep {
  code: number;
  event: string;
  created_at: string;
  place?: string;
}

export interface BelpostTrackingResult {
  number: string;
  steps: BelpostTrackingStep[];
  latestEvent: string | null;
  isDelivered: boolean;
}

/** Последний статус «Вручено» (код 21) на Белпочте. */
export function isBelpostDelivered(steps: BelpostTrackingStep[]): boolean {
  const latest = steps[0];
  if (!latest) return false;
  return latest.code === 21 || latest.event.trim().toLowerCase() === 'вручено';
}

export async function fetchBelpostTracking(trackingCode: string): Promise<BelpostTrackingResult> {
  const number = trackingCode.trim().replace(/\s/g, '');
  if (!number) {
    throw new Error('Пустой код отслеживания');
  }

  const response = await fetch(BELPOST_TRACKING_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Dynamo-Brest-Shop/1.0',
    },
    body: JSON.stringify({ number, show_order: true }),
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => null)) as {
    data?: Array<{ number: string; steps?: BelpostTrackingStep[] }>;
    message?: string;
    error?: { message?: string };
  } | null;

  if (!response.ok) {
    const message =
      payload?.error?.message || payload?.message || `HTTP ${response.status}`;
    throw new Error(message);
  }

  const item = payload?.data?.[0];
  if (!item) {
    throw new Error('TRACKING_CODE_NOT_FOUND');
  }

  const steps = item.steps ?? [];
  return {
    number: item.number,
    steps,
    latestEvent: steps[0]?.event ?? null,
    isDelivered: isBelpostDelivered(steps),
  };
}
