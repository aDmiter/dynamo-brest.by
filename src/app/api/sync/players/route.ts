import { NextResponse } from 'next/server';
import { syncPlayersFromComet } from '@/lib/comet-sync/sync-players';

export async function POST() {
  try {
    const result = await syncPlayersFromComet();
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
