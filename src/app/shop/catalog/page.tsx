// src/app/shop/catalog/page.tsx - Каталог товаров (главный модуль)
'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShirt, faArrowRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  oldPrice: string | null;
  images: string | null;
  productcategory?: { name: string } | null;
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);

  const loadProducts = useCallback(async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?page=${pageNum}&limit=8`);
      const data = await res.json();
      if (pageNum === 1) {
        setProducts(data.products);
      } else {
        setProducts((prev) => [...prev, ...data.products]);
      }
      setHasMore(data.hasMore);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProducts(nextPage);
  }, [page, loadProducts]);

  if (!started) {
    setStarted(true);
    loadProducts(1);
  }

  const groups: Product[][] = [];
  for (let i = 0; i < products.length; i += 4) {
    groups.push(products.slice(i, i + 4));
  }

  return (
    <div>
      {groups.length === 0 && !loading ? (
        <section className="flex h-screen items-center justify-center bg-white">
          <div className="text-center">
            <FontAwesomeIcon icon={faShirt} className="mb-4 text-5xl text-gray-300" />
            <p className="text-xl text-gray-500">Товаров пока нет</p>
          </div>
        </section>
      ) : (
        groups.map((group, groupIndex) => (
          <section
            key={groupIndex}
            className="shop-catalog relative flex min-h-screen flex-col bg-white"
          >
            <div className="shop-catalog__products flex flex-1 flex-col md:flex-row">
              {group.map((product) => {
                const images: string[] = product.images ? JSON.parse(product.images) : [];
                const hasDiscount =
                  product.oldPrice && Number(product.oldPrice) > Number(product.price);
                return (
                  <Link
                    key={product.id}
                    href={`/shop/product/${product.slug}`}
                    className="shop-catalog__product group relative flex flex-1 border-r border-b border-gray-200 overflow-hidden"
                  >
                    {images[0] ? (
                      <img
                        src={images[0]}
                        alt={product.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <FontAwesomeIcon icon={faShirt} className="text-6xl text-gray-300" />
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-8 pt-24">
                      <p className="font-heading text-xl font-bold uppercase tracking-wider text-white line-clamp-2">
                        {product.name}
                      </p>
                      {hasDiscount ? (
                        <div className="mt-2">
                          <p className="font-heading text-2xl font-bold text-red-500">
                            {Number(product.price).toFixed(2)} BYN
                          </p>
                          <p className="text-sm text-white/50 line-through">
                            {Number(product.oldPrice).toFixed(2)} BYN
                          </p>
                        </div>
                      ) : (
                        <p className="mt-2 font-heading text-2xl font-bold text-[#ee862c]">
                          {Number(product.price).toFixed(2)} BYN
                        </p>
                      )}
                      <span className="mt-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white/70 transition-colors group-hover:text-[#ee862c]">
                        Подробнее
                        <FontAwesomeIcon
                          icon={faArrowRight}
                          className="text-xs transition-transform group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {hasMore && groupIndex === groups.length - 1 && (
              <div className="shop-catalog__load-more py-8 text-center bg-white">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="group inline-flex items-center gap-3 px-10 py-5 text-sm font-bold uppercase tracking-wider text-gray-400 transition-all duration-300 hover:text-[#242C41] hover:scale-105 disabled:opacity-30"
                >
                  {loading ? (
                    'Загрузка...'
                  ) : (
                    <>
                      Больше товаров
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className="text-xs transition-transform group-hover:translate-y-1"
                      />
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="shop-catalog__title absolute left-0 bottom-0 pointer-events-none select-none">
              <span
                className="block text-[80px] font-black uppercase tracking-[0.1em] text-[#a5b3d5]/20 md:text-[120px] leading-none"
                style={{
                  writingMode: 'vertical-lr',
                  transform: 'rotate(180deg)',
                  fontFamily: "'Inter Tight', sans-serif",
                  fontWeight: 900,
                }}
              >
                МАГАЗИН
              </span>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
