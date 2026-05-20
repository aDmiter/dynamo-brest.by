// src/app/shop/catalog/CatalogHero.tsx
'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function CatalogHero() {
  return (
    <section className="shop-catalog__hero">
      <div className="shop-catalog__hero-watermark" aria-hidden>
        ФАН-ШОП
      </div>

      <div className="shop-catalog__hero-inner">
        <div>
          <div className="shop-catalog__hero-badge-row">
            <span className="shop-catalog__hero-badge">2026 Коллекция</span>
            <span className="shop-catalog__hero-badge-line" aria-hidden />
          </div>

          <p className="shop-catalog__hero-kicker">Официальный</p>
          <h1 className="shop-catalog__hero-title">ФАН-ШОП</h1>
        </div>

        <button
          type="button"
          className="shop-catalog__hero-action"
          onClick={() =>
            document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
          }
        >
          Смотреть товары
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    </section>
  );
}
