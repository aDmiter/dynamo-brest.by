// src/app/api/test-comet/route.ts - Тест соединения с COMET API
import { NextResponse } from 'next/server';

const COMET_API_KEY = process.env.COMET_API_KEY_PLAYERS || '';
const COMET_BASE_URL = process.env.COMET_API_BASE_URL || 'https://comet.abff.by';

export async function GET() {
  const steps: string[] = [];
  const errors: string[] = [];

  // Шаг 1: Проверяем переменные окружения
  steps.push(`COMET_API_KEY_PLAYERS = "${COMET_API_KEY.substring(0, 10)}..."`);
  steps.push(`COMET_API_BASE_URL = "${COMET_BASE_URL}"`);

  // Шаг 2: Пробуем запрос
  const url = `${COMET_BASE_URL}/data-backend/api/public/areports/run/0/25/?API_KEY=${COMET_API_KEY}`;
  steps.push(`URL: ${url}`);

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    steps.push(`Статус: ${response.status} ${response.statusText}`);

    const text = await response.text();
    steps.push(`Длина ответа: ${text.length}`);
    steps.push(`Первые 200 символов: ${text.substring(0, 200)}`);

    if (!response.ok) {
      errors.push(`HTTP ${response.status}: ${text.substring(0, 300)}`);
    } else {
      try {
        const data = JSON.parse(text);
        steps.push(`totalSize: ${data.totalSize}`);
        steps.push(`pageSize: ${data.pageSize}`);
        steps.push(`lastPage: ${data.lastPage}`);
        steps.push(`results count: ${data.results?.length || 0}`);

        if (data.results?.length > 0) {
          const first = data.results[0];
          steps.push(`Первый игрок: ${first.lastName} ${first.firstName} [${first.orgName}]`);
        }
      } catch {
        errors.push('Ответ не JSON');
      }
    }

    return NextResponse.json({ success: response.ok, steps, errors });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    errors.push(`Fetch error: ${message}`);
    return NextResponse.json({ success: false, steps, errors }, { status: 500 });
  }
}
