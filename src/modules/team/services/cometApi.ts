// src/modules/team/services/cometApi.ts - Клиент для API Comet АБФФ

// Временные значения для теста (потом перенесём в .env)
const COMET_BASE_URL = 'https://api-abff.analyticom.de';
const COMET_USER = 'dstasyuk';
const COMET_PASSWORD = 'AAPhUXqqK';

// Кодируем логин и пароль в Base64 для Basic Auth
function getAuthHeader(): string {
  const credentials = Buffer.from(`${COMET_USER}:${COMET_PASSWORD}`).toString('base64');
  return `Basic ${credentials}`;
}

// Типы данных Comet API
export interface CometPlayer {
  id: string;
  personId?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  shortName?: string;
  birthDate?: string;
  nationality?: string | { name: string; isoCode?: string };
  height?: number;
  weight?: number;
  position?: string | { name: string; code?: string };
  shirtNumber?: number;
  jerseyNumber?: number;
  photoUrl?: string;
  active?: boolean;
}

export interface CometTeam {
  id: string;
  name: string;
  shortName?: string;
  clubId?: string;
}

export interface CometMatch {
  id: string;
  homeTeam: { id: string; name: string; logoUrl?: string };
  awayTeam: { id: string; name: string; logoUrl?: string };
  homeScore?: number;
  awayScore?: number;
  matchDate: string;
  kickoffTime?: string;
  stadium?: string | { name: string };
  competition?: { id: string; name: string };
  round?: string;
  status?: string;
}

export interface CometCompetition {
  id: string;
  name: string;
  type?: string;
}

export interface CometStandingRow {
  position: number;
  team: { id: string; name: string; logoUrl?: string };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

// Универсальная функция запросов к API с авторизацией
async function cometFetch<T>(endpoint: string): Promise<T[]> {
  const url = `${COMET_BASE_URL}${endpoint}`;

  try {
    console.log(`=== Comet API запрос: ${url} ===`);

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: getAuthHeader(),
      },
      cache: 'no-store',
    });

    console.log(`Статус ответа: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.error(`Ошибка: ${response.status}`);
      return [];
    }

    const rawText = await response.text();
    console.log(`Первые 500 символов ответа:`, rawText.substring(0, 500));

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      console.error('Ответ не является JSON');
      return [];
    }

    console.log('Тип данных:', typeof data);
    if (typeof data === 'object' && data !== null) {
      console.log('Ключи:', Object.keys(data).slice(0, 10));
    }
    if (Array.isArray(data)) {
      console.log('Массив, длина:', data.length);
      if (data.length > 0) {
        console.log('Первый элемент:', JSON.stringify(data[0]).substring(0, 300));
      }
    }

    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.content && Array.isArray(data.content)) return data.content;

    const firstKey = Object.keys(data)[0];
    if (firstKey && Array.isArray(data[firstKey])) return data[firstKey];

    console.warn('Не удалось извлечь массив из ответа');
    return [];
  } catch (error) {
    console.error('Ошибка запроса:', error);
    return [];
  }
}

// Получить список соревнований
export async function fetchCompetitions(): Promise<CometCompetition[]> {
  return cometFetch<CometCompetition>('/api/export/comet/competitions');
}

// Получить команды соревнования
export async function fetchCompetitionTeams(competitionId: string): Promise<CometTeam[]> {
  return cometFetch<CometTeam>(`/api/export/comet/competitions/${competitionId}/teams`);
}

// Получить игроков команды
export async function fetchTeamPlayers(teamId: string): Promise<CometPlayer[]> {
  return cometFetch<CometPlayer>(`/api/export/comet/teams/${teamId}/players`);
}

// Получить матчи команды
export async function fetchTeamMatches(
  teamId: string,
  competitionId?: string
): Promise<CometMatch[]> {
  let endpoint = `/api/export/comet/matches?teamId=${teamId}`;
  if (competitionId) {
    endpoint += `&competitionId=${competitionId}`;
  }
  return cometFetch<CometMatch>(endpoint);
}

// Получить турнирную таблицу
export async function fetchCompetitionStandings(
  competitionId: string
): Promise<CometStandingRow[]> {
  return cometFetch<CometStandingRow>(`/api/export/comet/competitions/${competitionId}/standings`);
}
