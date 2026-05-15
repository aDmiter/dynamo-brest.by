// src/modules/shared/ui/Footer.tsx - Подвал сайта
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { socialLinks } from '@/modules/config/social';
import SponsorsSection from './SponsorsSection';

export default async function Footer() {
  return (
    <footer
      style={{ background: 'var(--color-bg-footer, #1A1A1A)', color: 'var(--color-text-stat)' }}
    >
      {/* Спонсоры */}
      <SponsorsSection />

      {/* Социальные сети */}
      <div
        style={{
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-bg-main)',
        }}
      >
        <div className="container mx-auto max-w-[1200px] px-4 py-10">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-2xl transition-all duration-300 hover:scale-110"
                style={{ color: 'var(--color-text-label)' }}
              >
                <FontAwesomeIcon icon={social.icon} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Основной футер */}
      <div className="container mx-auto px-8 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <img src="/images/logos/logo-white.png" alt="Динамо-Брест" className="h-8 w-auto" />
            </Link>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--color-text-stat)' }}>
              Официальный сайт футбольного клуба «Динамо-Брест»
            </p>
          </div>

          <div>
            <h3
              className="mb-6 text-sm font-bold uppercase tracking-[0.2em]"
              style={{ color: 'var(--color-text-heading)' }}
            >
              Разделы
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/news"
                  className="footer-link transition-colors"
                  style={{ color: 'var(--color-text-stat)' }}
                >
                  Новости
                </Link>
              </li>
              <li>
                <Link
                  href="/team/main/players"
                  className="footer-link transition-colors"
                  style={{ color: 'var(--color-text-stat)' }}
                >
                  Состав
                </Link>
              </li>
              <li>
                <Link
                  href="/team/main/calendar"
                  className="footer-link transition-colors"
                  style={{ color: 'var(--color-text-stat)' }}
                >
                  Календарь
                </Link>
              </li>
              <li>
                <Link
                  href="/shop/catalog"
                  className="footer-link transition-colors"
                  style={{ color: 'var(--color-text-stat)' }}
                >
                  Магазин
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3
              className="mb-6 text-sm font-bold uppercase tracking-[0.2em]"
              style={{ color: 'var(--color-text-heading)' }}
            >
              Социальные сети
            </h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-social-link text-2xl transition-colors"
                  style={{ color: 'var(--color-text-stat)' }}
                >
                  <FontAwesomeIcon icon={social.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div
          className="mt-16 pt-8 text-center text-sm"
          style={{
            borderTop: '1px solid var(--color-border)',
            color: 'var(--color-text-label)',
          }}
        >
          <p>&copy; {new Date().getFullYear()} ФК «Динамо-Брест». Все права защищены.</p>
        </div>
      </div>

      {/* Стили для ховеров — серверный компонент, поэтому через <style> */}
      <style>{`
        .footer-link:hover {
          color: var(--color-accent) !important;
        }
        .footer-social-link:hover {
          color: var(--color-accent) !important;
        }
      `}</style>
    </footer>
  );
}
