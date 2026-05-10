// src/app/shop/product/[slug]/page.tsx - Карточка товара
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductImages from './ProductImages';
import AddToCartButton from '@/modules/shop/components/AddToCartButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { productcategory: true },
  });

  if (!product) notFound();

  const images: string[] = product.images ? JSON.parse(product.images) : [];
  const sizes: string[] = product.sizes ? JSON.parse(product.sizes) : [];

  return (
    <div className="product-page bg-white">
      <div className="product-page__container mx-auto max-w-[1200px] px-4 py-16 md:px-8 md:ml-20">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Галерея изображений */}
          <div className="product-page__gallery">
            {images.length > 0 ? (
              <ProductImages images={images} productName={product.name} />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-gray-100">
                <img
                  src="/images/placeholder.jpg"
                  alt={product.name}
                  className="max-h-full max-w-full object-contain opacity-50"
                />
              </div>
            )}
          </div>

          {/* Информация */}
          <div className="product-page__info">
            <p className="text-sm text-gray-400 uppercase tracking-wider">
              {product.productcategory?.name || 'Товар'}
            </p>

            <h1
              className="mt-2 text-3xl font-bold text-[#242C41] md:text-4xl"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
            >
              {product.name}
            </h1>

            {/* Цена */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[#242C41]">
                {Number(product.price).toFixed(2)} BYN
              </span>
              {product.oldPrice && Number(product.oldPrice) > Number(product.price) && (
                <span className="text-xl text-gray-400 line-through">
                  {Number(product.oldPrice).toFixed(2)} BYN
                </span>
              )}
            </div>

            {/* Наличие */}
            <div className="mt-3 flex items-center gap-2 text-sm">
              {product.inStock ? (
                <span className="flex items-center gap-1 text-green-600">
                  <FontAwesomeIcon icon={faCheck} className="text-xs" /> В наличии
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-500">
                  <FontAwesomeIcon icon={faTimes} className="text-xs" /> Нет в наличии
                </span>
              )}
              {product.article && <span className="text-gray-400">• Арт: {product.article}</span>}
            </div>

            {/* Размеры */}
            {sizes.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#242C41]">
                  Размер
                </h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      className="border border-gray-300 px-5 py-2.5 text-sm font-medium text-[#242C41] transition-colors hover:border-[#242C41] hover:bg-[#242C41] hover:text-white"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Кнопка в корзину */}
            <div className="mt-8">
              <AddToCartButton productId={product.id} productName={product.name} />
            </div>

            {/* Описание */}
            {product.description && (
              <div className="mt-10 border-t border-gray-200 pt-8">
                <h3
                  className="mb-4 text-lg font-bold uppercase tracking-wider text-[#242C41]"
                  style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
                >
                  Описание
                </h3>
                <div className="prose max-w-none text-gray-600 leading-relaxed">
                  {product.description}
                </div>
              </div>
            )}

            {/* Состав */}
            {product.composition && (
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h3
                  className="mb-4 text-lg font-bold uppercase tracking-wider text-[#242C41]"
                  style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
                >
                  Состав
                </h3>
                <p className="text-gray-600 leading-relaxed">{product.composition}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
