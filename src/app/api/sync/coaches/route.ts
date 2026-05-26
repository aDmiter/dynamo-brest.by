import { NextResponse } from 'next/server';
import { syncCoachesFromComet } from '@/lib/comet-sync/sync-coaches';

export async function POST() {
  try {
    const result = await syncCoachesFromComet();
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
