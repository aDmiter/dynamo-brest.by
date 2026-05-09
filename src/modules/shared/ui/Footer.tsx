// src/modules/shared/ui/Footer.tsx - Подвал сайта
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFutbol } from '@fortawesome/free-solid-svg-icons';
import { faVk, faYoutube, faTelegram } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-gray-400">
      <div className="container mx-auto px-8 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <FontAwesomeIcon icon={faFutbol} className="text-2xl text-[#ee862c]" />
              <span className="text-lg font-bold text-white">Динамо-Брест</span>
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
              <a href="#" className="text-2xl hover:text-[#ee862c] transition-colors">
                <FontAwesomeIcon icon={faVk} />
              </a>
              <a href="#" className="text-2xl hover:text-[#ee862c] transition-colors">
                <FontAwesomeIcon icon={faYoutube} />
              </a>
              <a href="#" className="text-2xl hover:text-[#ee862c] transition-colors">
                <FontAwesomeIcon icon={faTelegram} />
              </a>
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
