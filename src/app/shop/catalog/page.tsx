// src/app/shop/catalog/page.tsx - Каталог товаров
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faChevronDown } from '@fortawesome/free-solid-svg-icons';

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
      const res = await fetch(`/api/products?page=${pageNum}&limit=12`);
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

  return (
    <div className="catalog min-h-screen bg-white">
      <div className="catalog__container mx-auto max-w-[1200px] px-4 py-16 md:px-8 md:ml-20">
        {/* Заголовок */}
        <div className="catalog__header mb-12">
          <h1
            className="catalog__title text-4xl font-bold text-[#242C41] md:text-5xl"
            style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
          >
            Каталог товаров
          </h1>
        </div>

        {products.length === 0 && !loading ? (
          <div className="catalog__empty py-20 text-center">
            <FontAwesomeIcon icon={faShoppingCart} className="mb-4 text-5xl text-gray-300" />
            <p className="text-xl text-gray-500">Товаров пока нет</p>
          </div>
        ) : (
          <div className="catalog__grid grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
            {products.map((product) => {
              const images: string[] = product.images ? JSON.parse(product.images) : [];
              return (
                <Link
                  key={product.id}
                  href={`/shop/product/${product.slug}`}
                  className="catalog__card group block"
                >
                  {/* Картинка */}
                  <div className="catalog__card-image relative aspect-square overflow-hidden bg-gray-100">
                    {images[0] ? (
                      <img
                        src={images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <FontAwesomeIcon icon={faShoppingCart} className="text-4xl text-gray-300" />
                      </div>
                    )}
                    {/* Скидка */}
                    {product.oldPrice && Number(product.oldPrice) > Number(product.price) && (
                      <span className="absolute left-2 top-2 bg-[#ee862c] px-2 py-1 text-xs font-bold text-white">
                        -{Math.round((1 - Number(product.price) / Number(product.oldPrice)) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Информация */}
                  <div className="catalog__card-info mt-3">
                    <p className="catalog__card-category text-xs text-gray-400 uppercase tracking-wider">
                      {product.productcategory?.name || 'Товар'}
                    </p>
                    <h3
                      className="catalog__card-title mt-1 text-sm font-bold text-[#242C41] line-clamp-2 transition-colors group-hover:text-[#ee862c]"
                      style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
                    >
                      {product.name}
                    </h3>
                    <div className="catalog__card-price mt-2 flex items-center gap-2">
                      <span className="text-lg font-bold text-[#242C41]">
                        {Number(product.price).toFixed(2)} BYN
                      </span>
                      {product.oldPrice && Number(product.oldPrice) > Number(product.price) && (
                        <span className="text-sm text-gray-400 line-through">
                          {Number(product.oldPrice).toFixed(2)} BYN
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Кнопка "Хочу еще" */}
        {hasMore && (
          <div className="catalog__load-more mt-12 text-center">
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
      </div>
    </div>
  );
}
