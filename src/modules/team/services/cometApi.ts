// src/modules/team/services/cometApi.ts - Клиент для API Comet АБФФ
const COMET_BASE_URL = 'https://api-abff.analyticom.de';
const COMET_TENANT = 'abff'; // Белорусская федерация футбола

// Типы данных Comet API
export interface CometTeam {
  id: string;
  name: string;
  shortName?: string;
  clubId?: string;
}

export interface CometPlayer {
  id: string;
  personId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  shortName?: string;
  birthDate?: string;
  nationality?: { name: string; isoCode: string };
  height?: number;
  weight?: number;
  position?: { name: string; code: string };
  shirtNumber?: number;
  photoUrl?: string;
  active: boolean;
}

export interface CometMatch {
  id: string;
  homeTeam: { id: string; name: string; logoUrl?: string };
  awayTeam: { id: string; name: string; logoUrl?: string };
  homeScore?: number;
  awayScore?: number;
  matchDate: string;
  kickoffTime?: string;
  stadium?: { name: string };
  competition: { id: string; name: string };
  round?: string;
  status: string; // SCHEDULED, LIVE, FINISHED, POSTPONED
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

// Универсальная функция запросов к API
async function cometFetch<T>(endpoint: string): Promise<T[]> {
  const url = `${COMET_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 3600 }, // Кэш на 1 час (для серверных запросов)
    });

    if (!response.ok) {
      console.error(`Comet API error: ${response.status} ${response.statusText}`);
      console.error(`URL: ${url}`);
      return [];
    }

    const data = await response.json();

    // Comet API обычно оборачивает данные в объект с полем data или content
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.content && Array.isArray(data.content)) return data.content;

    console.warn('Неизвестный формат ответа Comet API:', Object.keys(data));
    return [];
  } catch (error) {
    console.error('Ошибка запроса к Comet API:', error);
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
