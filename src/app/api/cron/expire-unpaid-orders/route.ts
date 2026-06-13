import { NextRequest, NextResponse } from 'next/server';
import { cancelExpiredUnpaidOrders } from '@/lib/shop-order-expiry';

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

  console.log('🔄 [CRON] Отмена просроченных неоплаченных заказов...');

  try {
    const result = await cancelExpiredUnpaidOrders();
    console.log(
      `[CRON] ✅ Просроченные заказы: проверено ${result.checked}, отменено ${result.cancelled}, ошибок ${result.errors} за ${result.durationSeconds}с`
    );
    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    console.error('[CRON] ❌ expire-unpaid-orders:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
