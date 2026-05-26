import Link from 'next/link';
import {
  BEPAID_MERCHANT_LOGOS,
  ORG_FULL_NAME,
  ORG_LEGAL_ADDRESS,
  ORG_STATE_REGISTRATION,
  ORG_STATE_REGISTRATION_DATE,
  ORG_TRADE_REGISTRY_LINE,
  ORG_UNP,
  SHOP_CONTACT_EMAIL,
  SHOP_CONTACT_PHONE,
  SHOP_CONTACT_PHONE_HREF,
  SHOP_WORKING_HOURS,
} from '@/modules/shop/data/organization-requisites';
import { SHOP_MAIN_MENU_LINKS } from '@/modules/shop/data/shop-nav-links';

type Variant = 'footer' | 'home';

interface ShopRequisitesBlockProps {
  variant?: Variant;
}

function ShopRequisitesHomeLines({ lineClass }: { lineClass: string }) {
  return (
    <>
      <p className={lineClass}>{ORG_FULL_NAME}</p>
      <p className={lineClass}>Режим работы интернет-магазина: {SHOP_WORKING_HOURS}</p>
      <p className={lineClass}>{ORG_TRADE_REGISTRY_LINE}</p>
    </>
  );
}

function ShopRequisitesFooterLines({ lineClass }: { lineClass: string }) {
  const stateRegLine = `Регистрирующий орган: ${ORG_STATE_REGISTRATION}, ${ORG_STATE_REGISTRATION_DATE}, УНП ${ORG_UNP}`;

  return (
    <>
      <p className={lineClass}>{ORG_FULL_NAME}</p>
      <p className={lineClass}>{stateRegLine}</p>
      <p className={lineClass}>{ORG_LEGAL_ADDRESS}</p>
      <p className={lineClass}>Режим работы интернет-магазина: {SHOP_WORKING_HOURS}</p>
      <p className={lineClass}>{ORG_TRADE_REGISTRY_LINE}</p>
      <p className={lineClass}>
        E-mail:{' '}
        <a href={`mailto:${SHOP_CONTACT_EMAIL}`}>{SHOP_CONTACT_EMAIL}</a>
        {' · '}
        Телефон: <a href={SHOP_CONTACT_PHONE_HREF}>{SHOP_CONTACT_PHONE}</a>
      </p>
    </>
  );
}

export default function ShopRequisitesBlock({ variant = 'footer' }: ShopRequisitesBlockProps) {
  const rootClass =
    variant === 'footer' ? 'site-footer__copyright-requisites' : 'shop-requisites';

  const lineClass =
    variant === 'footer' ? 'site-footer__copyright-line' : 'shop-requisites__line';

  const logosClass =
    variant === 'footer' ? 'site-footer__payment-logos' : 'shop-requisites__logos';

  return (
    <div className={rootClass}>
      {variant === 'footer' ? (
        <nav className="site-footer__shop-nav" aria-label="Интернет-магазин">
          <ul className="site-footer__shop-nav-list">
            {SHOP_MAIN_MENU_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="site-footer__shop-nav-link">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BEPAID_MERCHANT_LOGOS}
        alt="bePaid, Visa, MasterCard, Белкарт, Google Pay"
        className={`${logosClass} shop-requisites__merchant-logos`}
        width={520}
        height={56}
      />

      {variant === 'footer' ? <ShopRequisitesFooterLines lineClass={lineClass} /> : null}

      {variant === 'home' ? (
        <div className="shop-requisites__text">
          <ShopRequisitesHomeLines lineClass={lineClass} />
        </div>
      ) : null}
    </div>
  );
}
