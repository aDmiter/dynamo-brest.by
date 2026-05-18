import Link from 'next/link';
import CatalogProductCard, { type CatalogProductCardData } from './CatalogProductCard';

interface Props {
  products: CatalogProductCardData[];
}

export default function HomeShopSection({ products }: Props) {
  return (
    <section className="shop relative flex min-h-screen flex-col bg-white" aria-labelledby="home-shop-title">
      <div className="shop__inner">
        <header className="shop__header">
          <div className="shop__header-watermark" aria-hidden>
            Магазин
          </div>
          <div className="shop__header-row">
            <div className="shop__header-main">
              <div className="shop__header-accent" aria-hidden />
              <h2 id="home-shop-title" className="shop__title-text">
                Магазин
              </h2>
              {products.length > 0 && (
                <span className="shop__count">{products.length}</span>
              )}
            </div>
            <div className="shop__header-line" aria-hidden />
            <Link href="/shop/catalog" className="shop__link">
              Все товары →
            </Link>
          </div>
        </header>

        {products.length === 0 ? (
          <p className="shop__empty">Товары скоро появятся в каталоге</p>
        ) : (
          <div className="shop__grid">
            {products.map((product, i) => (
              <CatalogProductCard key={product.id} product={product} animationIndex={i} />
            ))}
          </div>
        )}
      </div>

      <div className="shop__decor-title" aria-hidden>
        <span>МАГАЗИН</span>
      </div>
    </section>
  );
}
