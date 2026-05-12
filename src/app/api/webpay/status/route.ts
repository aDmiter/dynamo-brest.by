// src/app/api/webpay/status/route.ts - Проверка статуса платежа
import { NextRequest, NextResponse } from 'next/server';
import { getTransactionStatus } from '@/lib/webpay';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderNum = searchParams.get('orderNum');

  if (!orderNum) {
    return NextResponse.json({ error: 'orderNum is required' }, { status: 400 });
  }

  const result = await getTransactionStatus(orderNum);

  if (!result) {
    return NextResponse.json({ error: 'Failed to get status' }, { status: 502 });
  }

  const tx = result.transactions?.transaction
    ? Array.isArray(result.transactions.transaction)
      ? result.transactions.transaction[0]
      : result.transactions.transaction
    : null;

  return NextResponse.json({
    success: true,
    transaction: tx,
    error_code: result.error_code,
  });
}
