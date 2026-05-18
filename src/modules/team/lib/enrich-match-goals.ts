import { getGoalsByMatchIds, type GoalScorerPublic } from '@/lib/match-protocol';

type MatchWithTeams = {
  id: string;
  homeTeamId: number | null;
  awayTeamId: number | null;
};

export type MatchWithGoals<T> = T & {
  goalsHome: GoalScorerPublic[];
  goalsAway: GoalScorerPublic[];
};

export async function enrichMatchesWithGoals<T extends MatchWithTeams>(
  matches: T[]
): Promise<MatchWithGoals<T>[]> {
  const homeTeamIds = new Map(matches.map((m) => [m.id, m.homeTeamId]));
  const awayTeamIds = new Map(matches.map((m) => [m.id, m.awayTeamId]));
  const goalsMap = await getGoalsByMatchIds(
    matches.map((m) => m.id),
    homeTeamIds,
    awayTeamIds
  );

  return matches.map((m) => {
    const g = goalsMap.get(m.id) ?? { home: [], away: [] };
    return {
      ...m,
      goalsHome: g.home,
      goalsAway: g.away,
    };
  });
}
