import { NextRequest, NextResponse } from 'next/server';
import { syncShippedOrdersFromBelpost } from '@/lib/belpost-order-sync';

const CRON_SECRET = process.env.CRON_SECRET || '';

function isAuthorized(request: NextRequest): boolean {
  if (!CRON_SECRET) return false;
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const urlToken = request.nextUrl.searchParams.get('token') || '';
  return token === CRON_SECRET || urlToken === CRON_SECRET;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('🔄 [CRON] Проверка статусов Белпочты для отправленных заказов...');

  try {
    const result = await syncShippedOrdersFromBelpost();
    console.log(
      `[CRON] ✅ Belpost: проверено ${result.checked}, доставлено ${result.delivered}, без изменений ${result.unchanged}, ошибок ${result.errors} за ${result.durationSeconds}с`
    );
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    console.error('[CRON] ❌ Belpost:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
