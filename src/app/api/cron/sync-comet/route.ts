import { NextRequest, NextResponse } from 'next/server';
import { runFullCometSync } from '@/lib/comet-sync/run-full';

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

  console.log('🔄 [CRON] Полная синхронизация COMET...');

  try {
    const result = await runFullCometSync();
    console.log(
      `[CRON] ${result.success ? '✅' : '⚠️'} COMET за ${result.durationSeconds}с, шагов: ${result.steps.length}`
    );
    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    console.error('[CRON] ❌ COMET:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
