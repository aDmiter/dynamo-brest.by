'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicket } from '@fortawesome/free-solid-svg-icons';
import type { NextTicketMatch } from '@/lib/get-next-ticket-match';

interface TicketBuyFabProps {
  match: NextTicketMatch;
}

export default function TicketBuyFab({ match }: TicketBuyFabProps) {
  return (
    <div className="ticket-buy-fab" aria-live="polite">
      <a
        href={match.ticketUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="ticket-buy-fab__link"
        aria-label="Купить билет на ближайший матч"
      >
        <span className="ticket-buy-fab__icon" aria-hidden>
          <FontAwesomeIcon icon={faTicket} className="text-lg" />
        </span>

        <span className="ticket-buy-fab__panel">
          <span className="ticket-buy-fab__logos">
            <img
              src={match.homeLogo}
              alt=""
              className="ticket-buy-fab__logo"
              width={28}
              height={28}
            />
            <span className="ticket-buy-fab__vs">vs</span>
            <img
              src={match.awayLogo}
              alt=""
              className="ticket-buy-fab__logo"
              width={28}
              height={28}
            />
          </span>

          <span className="ticket-buy-fab__cta">Купить билет</span>
        </span>
      </a>
    </div>
  );
}
