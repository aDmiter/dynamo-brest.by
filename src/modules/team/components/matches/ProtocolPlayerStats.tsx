import ProtocolAssistIcon from './ProtocolAssistIcon';
import ProtocolGoalIcon from './ProtocolGoalIcon';

function ProtocolCardIcons({ count, type }: { count: number; type: 'yellow' | 'red' }) {
  const label = type === 'yellow' ? 'жёлтых карточек' : 'красных карточек';
  const cardClass =
    type === 'yellow'
      ? 'match-protocol__card match-protocol__card--yellow'
      : 'match-protocol__card match-protocol__card--red';

  return (
    <div className="match-protocol__cards" aria-label={`${count} ${label}`}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={cardClass} aria-hidden />
      ))}
    </div>
  );
}

function ProtocolGoalIcons({ count }: { count: number }) {
  return (
    <div className="match-protocol__goals" aria-label={`${count} голов`}>
      {Array.from({ length: count }, (_, i) => (
        <ProtocolGoalIcon key={i} className="match-protocol__goals-icon" />
      ))}
    </div>
  );
}

function ProtocolAssistIcons({ count }: { count: number }) {
  return (
    <div className="match-protocol__assists" aria-label={`${count} голевых передач`}>
      {Array.from({ length: count }, (_, i) => (
        <ProtocolAssistIcon key={i} className="match-protocol__assists-icon" />
      ))}
    </div>
  );
}

interface Props {
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
}

export default function ProtocolPlayerStats({ goals, assists, yellowCards, redCards }: Props) {
  if (goals <= 0 && assists <= 0 && yellowCards <= 0 && redCards <= 0) return null;

  return (
    <span className="match-protocol__player-stats">
      {goals > 0 && <ProtocolGoalIcons count={goals} />}
      {assists > 0 && <ProtocolAssistIcons count={assists} />}
      {yellowCards > 0 && <ProtocolCardIcons count={yellowCards} type="yellow" />}
      {redCards > 0 && <ProtocolCardIcons count={redCards} type="red" />}
    </span>
  );
}
