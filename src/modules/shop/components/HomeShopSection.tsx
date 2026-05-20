import CatalogProductCard, { type CatalogProductCardData } from './CatalogProductCard';
import ShopRequisitesBlock from './ShopRequisitesBlock';
import HomeSectionHeader from '@/modules/shared/ui/HomeSectionHeader';

interface Props {
  products: CatalogProductCardData[];
}

export default function HomeShopSection({ products }: Props) {
  return (
    <section className="shop relative flex min-h-screen flex-col bg-white" aria-labelledby="home-shop-title">
      <div className="shop__inner home-section-inner">
        <HomeSectionHeader
          title="Магазин"
          linkHref="/shop/catalog"
          linkLabel="Все товары"
          titleId="home-shop-title"
        />

        {products.length === 0 ? (
          <p className="shop__empty">Товары скоро появятся в каталоге</p>
        ) : (
          <div className="shop__grid">
            {products.map((product, i) => (
              <CatalogProductCard key={product.id} product={product} animationIndex={i} />
            ))}
          </div>
        )}

        <ShopRequisitesBlock variant="home" />
      </div>

      <div className="shop__decor-title" aria-hidden>
        <span>МАГАЗИН</span>
      </div>
    </section>
  );
}
