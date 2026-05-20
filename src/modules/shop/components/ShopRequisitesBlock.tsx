import {
  BEPAID_MERCHANT_LOGOS,
  ORG_FULL_NAME,
  ORG_LEGAL_ADDRESS,
  ORG_STATE_REGISTRATION,
  ORG_STATE_REGISTRATION_DATE,
  ORG_TRADE_REGISTRY,
  ORG_UNP,
  SHOP_CONTACT_EMAIL,
  SHOP_CONTACT_PHONE,
  SHOP_CONTACT_PHONE_HREF,
  SHOP_WORKING_HOURS,
} from '@/modules/shop/data/organization-requisites';

type Variant = 'footer' | 'home';

interface ShopRequisitesBlockProps {
  variant?: Variant;
}

export default function ShopRequisitesBlock({ variant = 'footer' }: ShopRequisitesBlockProps) {
  const rootClass =
    variant === 'footer' ? 'site-footer__copyright-requisites' : 'shop-requisites';

  const lineClass =
    variant === 'footer' ? 'site-footer__copyright-line' : 'shop-requisites__line';

  const logosClass =
    variant === 'footer' ? 'site-footer__payment-logos' : 'shop-requisites__logos';

  const stateRegLine = `Регистрирующий орган: ${ORG_STATE_REGISTRATION}, ${ORG_STATE_REGISTRATION_DATE}, УНП ${ORG_UNP}`;

  return (
    <div className={rootClass}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BEPAID_MERCHANT_LOGOS}
        alt="bePaid, Visa, MasterCard, Белкарт, Google Pay"
        className={`${logosClass} shop-requisites__merchant-logos`}
        width={520}
        height={56}
      />

      <p className={lineClass}>{ORG_FULL_NAME}</p>
      <p className={lineClass}>{stateRegLine}</p>
      {ORG_TRADE_REGISTRY ? (
        <p className={lineClass}>Зарегистрирован в торговом реестре РБ: {ORG_TRADE_REGISTRY}</p>
      ) : null}
      <p className={lineClass}>{ORG_LEGAL_ADDRESS}</p>
      <p className={lineClass}>Режим работы интернет-магазина: {SHOP_WORKING_HOURS}</p>
      <p className={lineClass}>
        E-mail:{' '}
        <a href={`mailto:${SHOP_CONTACT_EMAIL}`}>{SHOP_CONTACT_EMAIL}</a>
        {' · '}
        Телефон: <a href={SHOP_CONTACT_PHONE_HREF}>{SHOP_CONTACT_PHONE}</a>
      </p>
    </div>
  );
}
