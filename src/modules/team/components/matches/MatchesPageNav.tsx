import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

type PageVariant = 'calendar' | 'results';

interface Props {
  teamRoute: 'main' | 'reserve' | 'women';
  variant: PageVariant;
}

export default function MatchesPageNav({ teamRoute, variant }: Props) {
  const href =
    variant === 'calendar' ? `/team/${teamRoute}/results` : `/team/${teamRoute}/calendar`;
  const label = variant === 'calendar' ? 'Результаты матчей' : 'Календарь матчей';

  return (
    <nav className="team-matches-v1__nav" aria-label="Связанные разделы">
      <Link href={href} className="team-matches-v1__nav-link">
        <span className="team-matches-v1__nav-link-text">{label}</span>
        <FontAwesomeIcon icon={faArrowRight} className="team-matches-v1__nav-link-icon" />
      </Link>
    </nav>
  );
}
