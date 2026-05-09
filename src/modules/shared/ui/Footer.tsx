// src/modules/shared/ui/Footer.tsx - Подвал сайта
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { socialLinks } from '@/modules/config/social';
import SponsorsSection from './SponsorsSection';

export default async function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-gray-400">
      {/* Спонсоры */}
      <SponsorsSection />

      {/* Социальные сети */}
      <div className="border-b border-white/5 bg-[#0B0F1C]">
        <div className="container mx-auto max-w-[1200px] px-4 py-10">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-2xl text-gray-500 transition-all duration-300 hover:text-white hover:scale-110"
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
            <p className="mt-4 text-sm leading-relaxed">
              Официальный сайт футбольного клуба «Динамо-Брест»
            </p>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-white">
              Разделы
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/news" className="hover:text-[#ee862c] transition-colors">
                  Новости
                </Link>
              </li>
              <li>
                <Link href="/team/main/players" className="hover:text-[#ee862c] transition-colors">
                  Состав
                </Link>
              </li>
              <li>
                <Link href="/team/main/calendar" className="hover:text-[#ee862c] transition-colors">
                  Календарь
                </Link>
              </li>
              <li>
                <Link href="/shop/catalog" className="hover:text-[#ee862c] transition-colors">
                  Магазин
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-white">
              Социальные сети
            </h3>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-2xl hover:text-[#ee862c] transition-colors"
                >
                  <FontAwesomeIcon icon={social.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} ФК «Динамо-Брест». Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
