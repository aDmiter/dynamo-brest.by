import { NextResponse } from 'next/server';
import { syncMatchProtocolData } from '@/lib/match-protocol-sync';

export async function GET() {
  try {
    const logs = await syncMatchProtocolData();
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
