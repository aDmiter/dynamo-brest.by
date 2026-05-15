// src/app/shop/catalog/CatalogGrid.tsx
'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShirt, faArrowRight } from '@fortawesome/free-solid-svg-icons';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  oldPrice: string | null;
  images: string | null;
  productcategory?: { id: string; name: string } | null;
}

interface Category {
  id: string;
  name: string;
}

interface Props {
  products: Product[];
  filter: string;
  categories: Category[];
}

export default function CatalogGrid({ products, filter, categories }: Props) {
  const filterLabel =
    filter === 'ALL' ? 'ВСЕ ТОВАРЫ' : categories.find((c) => c.id === filter)?.name || '';

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 32px 80px' }}>
      <div style={{ position: 'relative', marginBottom: 28, overflow: 'hidden' }}>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: -8,
            transform: 'translateY(-50%)',
            fontFamily: "'Inter Tight', sans-serif",
            fontSize: 'clamp(44px, 7vw, 72px)',
            fontWeight: 900,
            color: 'var(--color-accent)',
            opacity: 0.065,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase',
            userSelect: 'none',
            pointerEvents: 'none',
            lineHeight: 1,
          }}
        >
          {filterLabel}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 3,
              height: 26,
              borderRadius: 2,
              flexShrink: 0,
              background: 'linear-gradient(to bottom, var(--color-accent), var(--color-accent-30))',
            }}
          />
          <div
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 'clamp(18px, 2.4vw, 24px)',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            {filter === 'ALL' ? 'Все товары' : filterLabel}
          </div>
          <span
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontSize: 12,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.22)',
              marginLeft: 2,
            }}
          >
            {products.length}
          </span>
          <div
            style={{
              flex: 1,
              height: 1,
              marginLeft: 6,
              background: 'linear-gradient(to right, var(--color-accent-20), transparent)',
            }}
          />
        </div>
      </div>

      {products.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '100px 0',
            color: 'rgba(255,255,255,0.22)',
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          Товары не найдены
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
            gap: 16,
            paddingBottom: 80,
          }}
        >
          <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }`}</style>
          {products.map((product, i) => {
            const images: string[] = product.images ? JSON.parse(product.images) : [];
            const hasDiscount =
              product.oldPrice && Number(product.oldPrice) > Number(product.price);
            return (
              <Link
                key={product.id}
                href={`/shop/product/${product.slug}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-card)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.28s cubic-bezier(0.34,1.4,0.64,1)',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.3)',
                  animation: `fadeUp 0.4s ease forwards`,
                  animationDelay: `${i * 0.045}s`,
                  opacity: 0,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.transform = 'translateY(-5px)';
                  el.style.borderColor = 'var(--color-accent-30)';
                  el.style.boxShadow =
                    '0 20px 44px rgba(0,0,0,0.55), 0 0 0 1px var(--color-accent-12)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.transform = 'translateY(0)';
                  el.style.borderColor = 'var(--color-border)';
                  el.style.boxShadow = '0 4px 18px rgba(0,0,0,0.3)';
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    paddingBottom: '105%',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  {images[0] ? (
                    <img
                      src={images[0]}
                      alt={product.name}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        transition: 'transform 0.4s ease',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--color-bg-photo-placeholder)',
                      }}
                    >
                      <FontAwesomeIcon icon={faShirt} style={{ fontSize: 48, color: '#4b5563' }} />
                    </div>
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to top, var(--color-bg-main) 0%, rgba(13,17,23,0.18) 55%, transparent 100%)',
                      zIndex: 2,
                    }}
                  />
                  {product.productcategory && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        zIndex: 5,
                        background: 'var(--color-accent-10)',
                        border: '1.5px solid var(--color-accent)',
                        borderRadius: 6,
                        padding: '3px 9px',
                        fontSize: 9,
                        fontWeight: 700,
                        color: 'var(--color-accent)',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        backdropFilter: 'blur(6px)',
                        WebkitBackdropFilter: 'blur(6px)',
                      }}
                    >
                      {product.productcategory.name}
                    </div>
                  )}
                  {hasDiscount && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 5,
                        background: 'rgba(239,68,68,0.12)',
                        border: '1px solid rgba(239,68,68,0.5)',
                        borderRadius: 5,
                        padding: '3px 8px',
                        fontSize: 9,
                        fontWeight: 800,
                        color: 'var(--color-loss)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        backdropFilter: 'blur(6px)',
                        WebkitBackdropFilter: 'blur(6px)',
                      }}
                    >
                      SALE
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: '14px 16px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 500,
                      color: 'var(--color-text-label)',
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      marginBottom: 3,
                    }}
                  >
                    {product.productcategory?.name || 'Товар'}
                  </div>
                  <div
                    style={{
                      fontSize: 'clamp(15px, 1.8vw, 18px)',
                      fontWeight: 900,
                      color: '#ffffff',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.05,
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}
                  >
                    {product.name}
                  </div>
                  <div
                    style={{
                      height: 1,
                      width: 28,
                      marginBottom: 10,
                      background: 'linear-gradient(to right, var(--color-accent-30), transparent)',
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'auto',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <div
                        style={{
                          background: 'var(--color-accent-7)',
                          border: '1px solid var(--color-accent-30)',
                          borderRadius: 7,
                          padding: '4px 10px',
                          fontSize: 17,
                          fontWeight: 900,
                          color: 'var(--color-accent)',
                          letterSpacing: '-0.03em',
                        }}
                      >
                        {Number(product.price).toFixed(2)} BYN
                      </div>
                      {hasDiscount && (
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 500,
                            color: 'rgba(255,255,255,0.25)',
                            textDecoration: 'line-through',
                          }}
                        >
                          {Number(product.oldPrice).toFixed(2)} BYN
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        background: 'transparent',
                        border: '1.5px solid rgba(255,255,255,0.18)',
                        borderRadius: 7,
                        padding: '6px 12px',
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.6)',
                      }}
                    >
                      <FontAwesomeIcon icon={faArrowRight} style={{ width: 10, height: 10 }} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
