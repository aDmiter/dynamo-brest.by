'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShirt, faArrowRight } from '@fortawesome/free-solid-svg-icons';

export interface CatalogProductCardData {
  id: string;
  name: string;
  slug: string;
  price: string;
  oldPrice: string | null;
  images: string | null;
  productcategory?: { id: string; name: string } | null;
}

interface Props {
  product: CatalogProductCardData;
  animationIndex?: number;
}

export default function CatalogProductCard({ product, animationIndex = 0 }: Props) {
  const images: string[] = product.images ? JSON.parse(product.images) : [];
  const hasDiscount = product.oldPrice && Number(product.oldPrice) > Number(product.price);

  return (
    <Link
      href={`/shop/product/${product.slug}`}
      className="catalog-product-card"
      style={{
        animationDelay: `${animationIndex * 0.045}s`,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget;
        el.style.transform = 'translateY(-5px)';
        el.style.borderColor = 'var(--color-accent-30)';
        el.style.boxShadow = '0 20px 44px rgba(0,0,0,0.55), 0 0 0 1px var(--color-accent-12)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget;
        el.style.transform = 'translateY(0)';
        el.style.borderColor = 'var(--color-border)';
        el.style.boxShadow = '0 4px 18px rgba(0,0,0,0.3)';
      }}
    >
      <div className="catalog-product-card__media">
        {images[0] ? (
          <img src={images[0]} alt={product.name} className="catalog-product-card__img" />
        ) : (
          <div className="catalog-product-card__placeholder">
            <FontAwesomeIcon icon={faShirt} />
          </div>
        )}
        <div className="catalog-product-card__media-gradient" aria-hidden />
        {product.productcategory && (
          <div className="catalog-product-card__category">{product.productcategory.name}</div>
        )}
        {hasDiscount && <div className="catalog-product-card__sale">SALE</div>}
      </div>

      <div className="catalog-product-card__body">
        <div className="catalog-product-card__label">
          {product.productcategory?.name || 'Товар'}
        </div>
        <div className="catalog-product-card__name">{product.name}</div>
        <div className="catalog-product-card__divider" />
        <div className="catalog-product-card__footer">
          <div className="catalog-product-card__prices">
            <div className="catalog-product-card__price">
              {Number(product.price).toFixed(2)} BYN
            </div>
            {hasDiscount && (
              <span className="catalog-product-card__old-price">
                {Number(product.oldPrice).toFixed(2)} BYN
              </span>
            )}
          </div>
          <span className="catalog-product-card__arrow" aria-hidden>
            <FontAwesomeIcon icon={faArrowRight} />
          </span>
        </div>
      </div>
    </Link>
  );
}
