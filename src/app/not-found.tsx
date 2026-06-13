import type { Metadata } from 'next';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { NOT_FOUND_QUICK_LINKS } from '@/config/not-found-links';
import '@/styles/not-found-page.scss';

export const metadata: Metadata = {
  title: 'Страница не найдена | Динамо-Брест',
  description: 'Запрошенная страница не существует. Перейдите в популярные разделы сайта ФК «Динамо-Брест».',
  robots: { index: false, follow: true },
};

export default function NotFoundPage() {
  return (
    <section className="not-found-page" aria-labelledby="not-found-title">
      <div className="not-found-page__bg" aria-hidden />
      <span className="not-found-page__watermark" aria-hidden>
        404
      </span>

      <div className="not-found-page__inner">
        <div className="not-found-page__badge">Ошибка 404</div>
        <p className="not-found-page__code">404</p>
        <h1 id="not-found-title" className="not-found-page__title">
          Страница не найдена
        </h1>
        <p className="not-found-page__text">
          Возможно, ссылка ведёт со старой версии сайта или страница была перенесена. Выберите
          нужный раздел ниже или вернитесь на главную.
        </p>

        <div className="not-found-page__actions">
          <Link href="/" className="not-found-page__btn not-found-page__btn--primary">
            На главную
            <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
          </Link>
          <Link href="/news" className="not-found-page__btn not-found-page__btn--ghost">
            <FontAwesomeIcon icon={faArrowLeft} className="text-xs" />
            К новостям
          </Link>
        </div>

        <p className="not-found-page__grid-title">Популярные разделы</p>
        <nav className="not-found-page__grid" aria-label="Популярные разделы сайта">
          {NOT_FOUND_QUICK_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="not-found-page__card">
              <span className="not-found-page__card-icon">
                <FontAwesomeIcon icon={item.icon} />
              </span>
              <span className="not-found-page__card-label">{item.label}</span>
              <span className="not-found-page__card-desc">{item.description}</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
