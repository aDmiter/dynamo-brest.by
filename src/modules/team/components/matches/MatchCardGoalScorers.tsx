import type { GoalScorerPublic } from '@/lib/match-protocol';

interface Props {
  scorers: GoalScorerPublic[];
  align: 'left' | 'right';
}

export default function MatchCardGoalScorers({ scorers, align }: Props) {
  if (scorers.length === 0) return null;

  return (
    <ul
      className={`match-card-goals match-card-goals--${align}`}
      aria-label="Авторы голов"
    >
      {scorers.map((g, i) => (
        <li key={`${g.minute}-${g.name}-${i}`} className="match-card-goals__item">
          {g.minute && <span className="match-card-goals__minute">{g.minute}</span>}
          <span className="match-card-goals__name">{g.name}</span>
        </li>
      ))}
    </ul>
  );
}
