// src/lib/cometConfig.ts - Конфигурация COMET API

const baseUrl = process.env.COMET_API_BASE_URL || 'https://comet.abff.by';
const user = process.env.COMET_API_USER || '';
const password = process.env.COMET_API_PASSWORD || '';

function getBasicAuth(): string {
  const credentials = Buffer.from(`${user}:${password}`).toString('base64');
  return `Basic ${credentials}`;
}

// Универсальный URL для любого сохранённого отчёта
export function getCometReportUrl(apiKey: string, reportId: string): string {
  return `${baseUrl}/data-backend/api/public/areports/run/${reportId}/25/?API_KEY=${apiKey}`;
}

// Заголовки для любого запроса к COMET
export function getCometAuthHeaders(): Record<string, string> {
  return {
    Accept: 'application/json',
    Authorization: getBasicAuth(),
  };
}

// Именованные конфигурации для конкретных отчётов
export const cometReports = {
  players: {
    apiKey: process.env.COMET_API_KEY_PLAYERS || '',
    reportId: process.env.COMET_REPORT_PLAYERS_ID || '0',
  },
  // Будущие отчёты:
  // matches: {
  //   apiKey: process.env.COMET_API_KEY_MATCHES || '',
  //   reportId: process.env.COMET_REPORT_MATCHES_ID || '',
  // },
  // standings: {
  //   apiKey: process.env.COMET_API_KEY_STANDINGS || '',
  //   reportId: process.env.COMET_REPORT_STANDINGS_ID || '',
  // },
} as const;
