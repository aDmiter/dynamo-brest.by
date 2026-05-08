// src/modules/shared/ui/Footer.tsx - Подвал сайта
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFutbol } from '@fortawesome/free-solid-svg-icons';
import { faVk, faYoutube, faTelegram } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Логотип и описание */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <img src="/images/logos/logo-white.png" alt="Динамо-Брест" className="h-12 w-auto" />
            </Link>
            <p className="mt-3 text-sm">Официальный сайт футбольного клуба «Динамо-Брест»</p>
          </div>

          {/* Навигация */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Разделы</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/news" className="hover:text-white">
                  Новости
                </Link>
              </li>
              <li>
                <Link href="/team/main/players" className="hover:text-white">
                  Состав
                </Link>
              </li>
              <li>
                <Link href="/team/main/calendar" className="hover:text-white">
                  Календарь
                </Link>
              </li>
              <li>
                <Link href="/shop/catalog" className="hover:text-white">
                  Магазин
                </Link>
              </li>
            </ul>
          </div>

          {/* Соцсети */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Социальные сети</h3>
            <div className="flex gap-4">
              <a
                href="https://vk.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl hover:text-white"
              >
                <FontAwesomeIcon icon={faVk} />
              </a>
              <a
                href="https://youtube.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl hover:text-white"
              >
                <FontAwesomeIcon icon={faYoutube} />
              </a>
              <a
                href="https://t.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-2xl hover:text-white"
              >
                <FontAwesomeIcon icon={faTelegram} />
              </a>
            </div>
          </div>
        </div>

        {/* Копирайт */}
        <div className="mt-10 border-t border-gray-700 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} ФК «Динамо-Брест». Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
