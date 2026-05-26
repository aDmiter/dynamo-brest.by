import { NextResponse } from 'next/server';
import { runFullCometSync } from '@/lib/comet-sync/run-full';

export async function POST() {
  try {
    const result = await runFullCometSync();
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
