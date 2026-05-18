import type { TeamStandingsBundle } from '@/lib/standings';
import { getStandingPosition } from '@/lib/standings';
import type { MatchData } from './types';

export function getOpponentClubId(match: MatchData): number | null {
  return match.isHome ? match.awayTeamId : match.homeTeamId;
}

export function getDynamoClubId(match: MatchData): number | null {
  return match.isHome ? match.homeTeamId : match.awayTeamId;
}

export function getTablePositionForClub(
  bundle: TeamStandingsBundle | null | undefined,
  clubId: number | null,
): number | null {
  return getStandingPosition(bundle, clubId);
}

export function getCompetitionColor(tournament: string | null): string {
  if (!tournament) return 'var(--color-accent)';
  const t = tournament.toLowerCase();
  if (t.includes('кубок') && !t.includes('супер')) return '#3b82f6';
  if (t.includes('суперкубок')) return '#d4af37';
  return 'var(--color-accent)';
}

export type MatchOutcome = 'win' | 'draw' | 'loss';

export function getMatchOutcome(match: MatchData): MatchOutcome | null {
  if (match.homeScore === null || match.awayScore === null) return null;
  const ourScore = match.isHome ? match.homeScore : match.awayScore;
  const theirScore = match.isHome ? match.awayScore : match.homeScore;
  if (ourScore > theirScore) return 'win';
  if (ourScore === theirScore) return 'draw';
  return 'loss';
}

export const MATCH_OUTCOME_LABEL: Record<MatchOutcome, string> = {
  win: 'Победа',
  draw: 'Ничья',
  loss: 'Поражение',
};

const OUR_LOGO = '/images/logos/logo-white.png';

export function getMatchDisplay(
  match: MatchData | null,
  oppLogo: string | null,
): {
  homeLogo: string;
  awayLogo: string;
  homeTeam: string;
  awayTeam: string;
} | null {
  if (!match) return null;
  return {
    homeLogo: match.isHome ? OUR_LOGO : oppLogo || OUR_LOGO,
    awayLogo: match.isHome ? oppLogo || '/images/placeholder.jpg' : OUR_LOGO,
    homeTeam: match.homeTeam,
    awayTeam: match.awayTeam,
  };
}

export function getResultBorderClass(match: MatchData | null): string {
  if (!match || match.homeScore === null || match.awayScore === null) {
    return 'home-match__card--result-neutral';
  }
  const ourScore = match.isHome ? match.homeScore : match.awayScore;
  const theirScore = match.isHome ? match.awayScore : match.homeScore;
  if (ourScore > theirScore) return 'home-match__card--result-win';
  if (ourScore === theirScore) return 'home-match__card--result-draw';
  return 'home-match__card--result-loss';
}

/** Для Version Base (Tailwind border classes) */
export function getResultBorderColorTailwind(match: MatchData | null): string {
  if (!match || match.homeScore === null || match.awayScore === null) {
    return 'border-t-gray-600';
  }
  const ourScore = match.isHome ? match.homeScore : match.awayScore;
  const theirScore = match.isHome ? match.awayScore : match.homeScore;
  if (ourScore > theirScore) return 'border-t-[var(--color-win)]';
  if (ourScore === theirScore) return 'border-t-[var(--color-accent-hover)]';
  return 'border-t-[var(--color-loss)]';
}
