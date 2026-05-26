// src/modules/shared/ui/Footer.tsx — подвал сайта
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { socialLinks } from '@/modules/config/social';
import { prisma } from '@/lib/prisma';
import { withDb } from '@/lib/with-db';
import { getFooterItemHref, isFooterItemExternal } from '@/lib/footer-menu';
import SponsorsSection from './SponsorsSection';
import ShopRequisitesBlock from '@/modules/shop/components/ShopRequisitesBlock';
import {
  SHOP_CONTACT_PHONE,
  SHOP_CONTACT_PHONE_HREF,
} from '@/modules/shop/data/organization-requisites';
import { getPublicUiTranslator } from '@/lib/ui-translations-server';
import { getSiteLangFromCookies } from '@/lib/content-translations-server';
import { loadBeTranslationsMap, localizeCmsPageRecord } from '@/lib/content-translations';

export default async function Footer() {
  const { t } = await getPublicUiTranslator();
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

  const renderLinks = (blockItems: typeof menuItems) => (
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
              {t('ui.footer.mail')}{' '}
              <a href={`mailto:${contactsData.email}`} className="site-footer__link">
                {contactsData.email}
              </a>
            </p>
            <p className="site-footer__contacts-line">
              {t('ui.footer.phone')}{' '}
              <a href={SHOP_CONTACT_PHONE_HREF} className="site-footer__link">
                {SHOP_CONTACT_PHONE}
              </a>
            </p>
            <h4 className="site-footer__address-label">{contactsData.addressLabel}</h4>
            <p className="site-footer__address">{contactsData.address}</p>
          </div>
        </div>

        <div className="site-footer__copyright">
          <ShopRequisitesBlock variant="footer" />
          <p className="site-footer__copyright-line">{t('ui.footer.official')}</p>
          <p className="site-footer__copyright-line">
            <a href="https://webo.by/" className="site-footer__copyright-link">
              {t('ui.footer.created_by')}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
