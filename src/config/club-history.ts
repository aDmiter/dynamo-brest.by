export {
  CLUB_HISTORY_INTRO_BLOCKS,
  CLUB_HISTORY_YEARS,
} from './club-history-data';
export type { ClubHistoryBlock, ClubHistoryYear } from './club-history-data';

import { CLUB_HISTORY_INTRO, CLUB_HISTORY_YEARS } from './club-history-data';

export const CLUB_HISTORY_INTRO_PARAGRAPHS = CLUB_HISTORY_INTRO.filter(
  (p) => !p.includes('| Клуб'),
);

export function getClubHistoryDecades(): number[] {
  const decades = new Set<number>();
  for (const entry of CLUB_HISTORY_YEARS) {
    decades.add(Math.floor(entry.year / 10) * 10);
  }
  return [...decades].sort((a, b) => b - a);
}
