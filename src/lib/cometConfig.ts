// src/lib/cometConfig.ts - Конфигурация COMET API

const baseUrl = process.env.COMET_API_BASE_URL || 'https://comet.abff.by';

// Именованные конфигурации для конкретных отчётов
export const cometReports = {
  players: {
    apiKey: process.env.COMET_API_KEY_PLAYERS || '',
  },
  matches: {
    apiKey: process.env.COMET_API_KEY_MATCHES || '',
  },
  facilities: {
    apiKey: process.env.COMET_API_KEY_FACILITIES || '',
  },
} as const;

// Универсальный URL для любого сохранённого отчёта
// page=0, pageSize=500 (максимум)
export function getCometReportUrl(
  apiKey: string,
  page: number = 0,
  pageSize: number = 500
): string {
  return `${baseUrl}/data-backend/api/public/areports/run/${page}/${pageSize}/?API_KEY=${apiKey}`;
}
