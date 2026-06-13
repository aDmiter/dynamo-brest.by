import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSection } from '@/lib/admin-api-auth';
import { syncBelpostCountryPrices } from '@/lib/belpost-country-sync';

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const auth = await requireAdminSection('shop');
  if (auth instanceof NextResponse) return auth;

  try {
    let offset = 0;
    let limit: number | undefined;

    try {
      const body = await request.json();
      if (typeof body?.offset === 'number' && Number.isFinite(body.offset)) {
        offset = Math.max(0, Math.floor(body.offset));
      }
      if (typeof body?.limit === 'number' && Number.isFinite(body.limit)) {
        limit = Math.max(1, Math.min(30, Math.floor(body.limit)));
      }
    } catch {
      /* пустое тело — синхронизация одной порции по умолчанию */
    }

    const summary = await syncBelpostCountryPrices({
      offset,
      limit: limit ?? 15,
    });
    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
