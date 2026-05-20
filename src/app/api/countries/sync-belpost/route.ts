import { NextResponse } from 'next/server';
import { requireAdminSection } from '@/lib/admin-api-auth';
import { syncBelpostCountryPrices } from '@/lib/belpost-country-sync';

export const maxDuration = 300;

export async function POST() {
  const auth = await requireAdminSection('shop');
  if (auth instanceof NextResponse) return auth;

  try {
    const summary = await syncBelpostCountryPrices();
    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
