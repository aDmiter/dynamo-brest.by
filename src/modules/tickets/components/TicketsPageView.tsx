import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faGlobe,
  faPhone,
  faEnvelope,
  faTicket,
  faShieldHalved,
  faChildren,
  faWheelchair,
} from '@fortawesome/free-solid-svg-icons';
import {
  TICKETS_AFISHA_URL,
  TICKETS_STADIUM_ADDRESS,
  TICKETS_SUPPORT_EMAIL,
  TICKETS_SUPPORT_PHONE,
  TICKETS_SUPPORT_PHONE_HREF,
  ticketsOnlineNotice,
  ticketsPaymentMethods,
  ticketsPromotions,
  ticketsPurchaseChannels,
} from '@/modules/shared/data/tickets-content';
import TicketsPricesTable from '@/modules/tickets/components/TicketsPricesTable';

export interface TicketsNextMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  tournament: string | null;
  stadium: string | null;
  ticketUrl: string | null;
}

interface Props {
  nextMatch: TicketsNextMatch | null;
}

const channelIcons = {
  ticket: faTicket,
  globe: faGlobe,
} as const;

const promoIcons = [faChildren, faWheelchair];

function formatMatchDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TicketsPageView({ nextMatch }: Props) {
  const buyUrl = nextMatch?.ticketUrl || TICKETS_AFISHA_URL;

  return (
    <div className="tickets-page" style={{ fontFamily: "'Inter Tight', sans-serif" }}>
      <section className="tickets-page__hero">
        <img
          src="/images/Stadium.jpeg"
          alt=""
          className="tickets-page__hero-bg"
          aria-hidden
        />
        <div className="tickets-page__hero-overlay" aria-hidden />
        <div className="tickets-page__glow tickets-page__glow--accent" aria-hidden />
        <div className="tickets-page__glow tickets-page__glow--primary" aria-hidden />
        <div className="tickets-page__watermark" aria-hidden>
          БИЛЕТЫ
        </div>

        <div className="tickets-page__hero-inner">
          <div className="tickets-page__hero-grid">
            <div>
              <p className="tickets-page__subtitle">ОСК «Брестский»</p>
              <h1 className="tickets-page__title">Билеты на матчи</h1>
              <p className="tickets-page__hero-lead">
                Поддержите «Динамо-Брест» на стадионе — купите билет в кассе или онлайн с
                электронным пропуском на e-mail.
              </p>
              <div className="tickets-page__pills">
                <span className="tickets-page__pill">
                  <FontAwesomeIcon icon={faTicket} />
                  Кассы стадиона
                </span>
                <span className="tickets-page__pill">
                  <FontAwesomeIcon icon={faGlobe} />
                  Онлайн 24afisha
                </span>
                <span className="tickets-page__pill">
                  <FontAwesomeIcon icon={faShieldHalved} />
                  Безопасная оплата
                </span>
              </div>
            </div>

            <div className="tickets-glass tickets-glass--accent tickets-page__match-card">
              {nextMatch ? (
                <>
                  <p className="tickets-page__match-label">Следующий домашний матч</p>
                  <p className="tickets-page__match-teams">
                    {nextMatch.homeTeam}
                    <span style={{ color: 'var(--color-text-stat)', fontWeight: 600 }}> — </span>
                    {nextMatch.awayTeam}
                  </p>
                  <p className="tickets-page__match-meta">
                    {nextMatch.tournament && <>{nextMatch.tournament} · </>}
                    {formatMatchDate(nextMatch.matchDate)}
                    {nextMatch.stadium && (
                      <>
                        <br />
                        {nextMatch.stadium}
                      </>
                    )}
                  </p>
                  <a
                    href={buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tickets-page__cta"
                  >
                    Купить билеты
                    <FontAwesomeIcon icon={faArrowRight} />
                  </a>
                </>
              ) : (
                <>
                  <p className="tickets-page__match-label">Онлайн-покупка</p>
                  <p className="tickets-page__match-teams">Билеты на все матчи</p>
                  <p className="tickets-page__match-meta">
                    Расписание домашних игр — в календаре команды. Покупка через официального
                    оператора.
                  </p>
                  <a
                    href={TICKETS_AFISHA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tickets-page__cta"
                  >
                    Перейти к покупке
                    <FontAwesomeIcon icon={faArrowRight} />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="tickets-page__content" id="tickets-info">
        <section className="tickets-page__section">
          <h2 className="tickets-page__section-title">Схема стадиона</h2>
          <div className="tickets-glass tickets-page__scheme">
            <img
              src="/images/tickets/stadium_scheme_2024.png"
              alt="Схема секторов стадиона ОСК «Брестский»"
              loading="lazy"
            />
          </div>
        </section>

        <section className="tickets-page__section">
          <h2 className="tickets-page__section-title">Цены на билеты в сезоне 2026</h2>
          <div className="tickets-glass tickets-page__prices">
            <TicketsPricesTable />
          </div>
        </section>

        <section className="tickets-page__section">
          <h2 className="tickets-page__section-title">Где купить билет</h2>
          <div className="tickets-page__channels">
            {ticketsPurchaseChannels.map((channel) => (
              <div key={channel.id} className="tickets-glass tickets-page__channel">
                <div className="tickets-page__channel-icon">
                  <FontAwesomeIcon icon={channelIcons[channel.icon]} />
                </div>
                <h3 className="tickets-page__channel-title">{channel.title}</h3>
                <p className="tickets-page__channel-desc">{channel.description}</p>
                <p className="tickets-page__channel-note">{channel.note}</p>
                {channel.href && (
                  <a
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tickets-page__cta"
                    style={{ marginTop: 20, width: 'auto', display: 'inline-flex' }}
                  >
                    24afisha.by
                    <FontAwesomeIcon icon={faArrowRight} />
                  </a>
                )}
              </div>
            ))}
          </div>
          <div className="tickets-glass tickets-page__notice" style={{ marginTop: 24 }}>
            {ticketsOnlineNotice}
          </div>
        </section>

        <section className="tickets-page__section">
          <h2 className="tickets-page__section-title">Способ оплаты при покупке через интернет</h2>
          <div className="tickets-page__promo-grid">
            {ticketsPaymentMethods.map((method) => (
              <div key={method.title} className="tickets-glass tickets-page__promo">
                <h3>{method.title}</h3>
                <p>{method.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="tickets-page__section">
          <h2 className="tickets-page__section-title">Акции и скидки</h2>
          <div className="tickets-page__promo-grid">
            {ticketsPromotions.map((promo, index) => (
              <div key={promo.title} className="tickets-glass tickets-page__promo">
                <div
                  className="tickets-page__channel-icon"
                  style={{ margin: '0 0 14px', width: 44, height: 44, fontSize: '1rem' }}
                >
                  <FontAwesomeIcon icon={promoIcons[index] ?? faChildren} />
                </div>
                <h3>{promo.title}</h3>
                <p>{promo.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="tickets-page__section">
          <h2 className="tickets-page__section-title">Остались вопросы?</h2>
          <div className="tickets-glass tickets-page__contact">
            <h2>Мы всегда готовы помочь вам сделать правильный выбор</h2>
            <h3
              style={{
                fontSize: '0.875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--color-accent)',
                marginBottom: 16,
              }}
            >
              По билетам и абонементам
            </h3>
            <p>
              <FontAwesomeIcon icon={faPhone} style={{ marginRight: 8 }} />
              <a href={TICKETS_SUPPORT_PHONE_HREF}>{TICKETS_SUPPORT_PHONE}</a> — техподдержка и
              помощь в покупке
            </p>
            <p>
              <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: 8 }} />
              <a href={`mailto:${TICKETS_SUPPORT_EMAIL}`}>{TICKETS_SUPPORT_EMAIL}</a>
            </p>
            <p style={{ marginTop: 20, fontSize: '0.875rem' }}>{TICKETS_STADIUM_ADDRESS}</p>
            <Link
              href="/team/main/calendar"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 24,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
              }}
            >
              Календарь матчей
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
