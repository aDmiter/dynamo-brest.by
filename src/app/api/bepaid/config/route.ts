import { NextResponse } from 'next/server';
import { BEPAID_IS_TEST } from '@/lib/bepaid';
import { isBePaidConfigured, isBePaidMockMode } from '@/lib/bepaid-config';

/** Публичные флаги для UI checkout (без секретов). */
export async function GET() {
  return NextResponse.json({
    mock: isBePaidMockMode(),
    test: BEPAID_IS_TEST,
    configured: isBePaidConfigured(),
  });
}
