// Загрузка постраничных отчётов COMET (areports)

export interface CometReportPage {
  results: Record<string, unknown>[];
  lastPage?: number;
}

export async function fetchCometReportPage(
  apiKey: string,
  page: number,
  pageSize: number = 500
): Promise<CometReportPage> {
  const baseUrl = process.env.COMET_API_BASE_URL || 'https://comet.abff.by';
  const url = `${baseUrl}/data-backend/api/public/areports/run/${page}/${pageSize}/?API_KEY=${apiKey}`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`COMET HTTP ${response.status}`);
  }

  const data = (await response.json()) as CometReportPage;
  return {
    results: data.results || [],
    lastPage: data.lastPage ?? page,
  };
}

export async function fetchAllCometReport(
  apiKey: string,
  pageSize: number = 500
): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];
  let page = 0;

  while (true) {
    const data = await fetchCometReportPage(apiKey, page, pageSize);
    if (data.results.length === 0) break;
    all.push(...data.results);
    if (page >= (data.lastPage ?? page)) break;
    page++;
  }

  return all;
}
