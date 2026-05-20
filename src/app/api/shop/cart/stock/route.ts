import { NextRequest, NextResponse } from 'next/server';
import { checkStockAvailability, type StockLineItem } from '@/lib/shop-stock';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const items = (body.items ?? []) as StockLineItem[];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ lines: [], ok: true });
    }

    const normalized = items
      .filter((i) => i?.productId && Number(i.quantity) > 0)
      .map((i) => ({
        productId: String(i.productId),
        quantity: Number(i.quantity),
        size: i.size ? String(i.size) : null,
      }));

    const lines = await checkStockAvailability(normalized);
    const ok = lines.every((l) => l.ok);

    return NextResponse.json({ lines, ok });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
