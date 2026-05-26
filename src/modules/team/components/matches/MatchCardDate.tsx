import {
  formatMatchDateLong,
  formatMatchDateShort,
  formatWeekdayShort,
} from '@/modules/team/lib/match-date-format';

const WEEKDAYS = [
  'воскресенье',
  'понедельник',
  'вторник',
  'среда',
  'четверг',
  'пятница',
  'суббота',
];

interface Props {
  matchDate: string;
  tbd?: boolean;
}

export default function MatchCardDate({ matchDate, tbd = false }: Props) {
  if (tbd) {
    return (
      <div className="team-matches-v1__date">
        <span className="team-matches-v1__date-weekday">Дата</span>
        <span className="team-matches-v1__date-main team-matches-v1__date-main--muted">
          Уточняется
        </span>
      </div>
    );
  }

  const d = new Date(matchDate);

  return (
    <div className="team-matches-v1__date">
      <span className="team-matches-v1__date-weekday team-matches-v1__date-weekday--full">
        {WEEKDAYS[d.getDay()]}
      </span>
      <span className="team-matches-v1__date-weekday team-matches-v1__date-weekday--short">
        {formatWeekdayShort(matchDate)}
      </span>
      <span className="team-matches-v1__date-main team-matches-v1__date-main--full">
        {formatMatchDateLong(matchDate)}
      </span>
      <span className="team-matches-v1__date-main team-matches-v1__date-main--short">
        {formatMatchDateShort(matchDate)}
      </span>
    </div>
  );
}
