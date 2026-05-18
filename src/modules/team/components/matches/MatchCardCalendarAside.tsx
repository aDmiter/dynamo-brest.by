import MatchCardDate from '@/modules/team/components/matches/MatchCardDate';

interface Props {
  matchDate: string;
  tbd?: boolean;
}

export default function MatchCardCalendarAside({ matchDate, tbd = false }: Props) {
  return (
    <aside className="team-matches-v1__card-aside" aria-label="Дата матча">
      <MatchCardDate matchDate={matchDate} tbd={tbd} />
    </aside>
  );
}
