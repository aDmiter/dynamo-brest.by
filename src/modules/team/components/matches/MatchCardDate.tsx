const WEEKDAYS = [
  'воскресенье',
  'понедельник',
  'вторник',
  'среда',
  'четверг',
  'пятница',
  'суббота',
];

const MONTHS = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
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
      <span className="team-matches-v1__date-weekday">{WEEKDAYS[d.getDay()]}</span>
      <span className="team-matches-v1__date-main">
        {d.getDate()} {MONTHS[d.getMonth()]} {d.getFullYear()}
      </span>
    </div>
  );
}
