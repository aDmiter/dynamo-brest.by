// src/modules/shared/ui/Footer.tsx — подвал сайта
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { socialLinks } from '@/modules/config/social';
import { prisma } from '@/lib/prisma';
import { withDb } from '@/lib/with-db';
import { getFooterItemHref, isFooterItemExternal } from '@/lib/footer-menu';
import SponsorsSection from './SponsorsSection';

export default async function Footer() {
  const [items, contacts] = await withDb(
    () =>
      Promise.all([
        prisma.footermenuitem.findMany({
          where: { isActive: true },
          orderBy: [{ block: 'asc' }, { order: 'asc' }],
        }),
        prisma.footercontacts.findUnique({ where: { id: 'main' } }),
      ]),
    [[], null] as const,
    'footer',
  );

  const block1 = items.filter((i) => i.block === 1);
  const block2 = items.filter((i) => i.block === 2);

  const contactsData = contacts ?? {
    title: 'Контакты',
    email: 'info@dynamo-brest.by',
    addressLabel: 'Адрес офиса в Бресте',
    address: 'г. Брест, ул. Гоголя, 9',
  };

  const renderLinks = (blockItems: typeof items) => (
    <ul className="site-footer__links">
      {blockItems.map((item) => {
        const href = getFooterItemHref(item);
        const external = isFooterItemExternal(item);
        const className = 'site-footer__link';

        if (external) {
          return (
            <li key={item.id}>
              <a
                href={href}
                className={className}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.title}
              </a>
            </li>
          );
        }

        if (item.type === 'link') {
          return (
            <li key={item.id}>
              <a href={href} className={className}>
                {item.title}
              </a>
            </li>
          );
        }

        return (
          <li key={item.id}>
            <Link href={href} className={className}>
              {item.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <footer className="site-footer">
      <SponsorsSection />

      <div className="site-footer__social-bar">
        <div className="site-footer__social-inner">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="site-footer__social-icon"
            >
              <FontAwesomeIcon icon={social.icon} />
            </a>
          ))}
        </div>
      </div>

      <div className="site-footer__main">
        <div className="site-footer__grid">
          <div className="site-footer__col">{renderLinks(block1)}</div>
          <div className="site-footer__col">{renderLinks(block2)}</div>
          <div className="site-footer__col site-footer__contacts">
            <h3 className="site-footer__contacts-title">{contactsData.title}</h3>
            <p className="site-footer__contacts-line">
              Почта:{' '}
              <a href={`mailto:${contactsData.email}`} className="site-footer__link">
                {contactsData.email}
              </a>
            </p>
            <h4 className="site-footer__address-label">{contactsData.addressLabel}</h4>
            <p className="site-footer__address">{contactsData.address}</p>
          </div>
        </div>

        <div className="site-footer__copyright">
          <div className="site-footer__copyright-requisites">
            <img
              src="/images/webpay_logos.png"
              alt="Платёжные системы: Visa, MasterCard, Белкарт"
              className="site-footer__payment-logos"
              width={360}
              height={48}
            />
            <p className="site-footer__copyright-line">
              Учреждение физической культуры и спорта «Государственный футбольный клуб «Динамо-Брест»»
            </p>
            <p className="site-footer__copyright-line">УНП 290724129</p>
            <p className="site-footer__copyright-line">
              224020, Республика Беларусь, г. Брест, ул. Гоголя, 9
            </p>
            <p className="site-footer__copyright-line">
              Режим работы интернет-магазина: круглосуточно
            </p>
            <p className="site-footer__copyright-line">
              Зарегистрирован в торговом реестре РБ: №1555 от 20.05.2026
            </p>
          </div>
          <p className="site-footer__copyright-line">Official Website of FC Dynamo Brest</p>
          <p className="site-footer__copyright-line">
            <a href="https://webo.by/" className="site-footer__copyright-link">
              Создание сайта: WEBO.by
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
