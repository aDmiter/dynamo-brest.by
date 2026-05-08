// src/app/shop/product/[slug]/page.tsx - Карточка товара
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import AddToCartButton from '@/modules/shop/components/AddToCartButton';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) {
    notFound();
  }

  const images: string[] = product.images ? JSON.parse(product.images) : [];
  const sizes: string[] = product.sizes ? JSON.parse(product.sizes) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Галерея изображений */}
        <div>
          <div className="overflow-hidden rounded-xl bg-gray-100">
            {images.length > 0 ? (
              <img src={images[0]} alt={product.name} className="h-[400px] w-full object-cover" />
            ) : (
              <div className="flex h-[400px] items-center justify-center text-gray-400">
                <FontAwesomeIcon icon={faShoppingCart} className="text-6xl" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${product.name} ${i + 1}`}
                  className="h-20 w-20 rounded-lg object-cover cursor-pointer border-2 border-transparent hover:border-[#003366]"
                />
              ))}
            </div>
          )}
        </div>

        {/* Информация о товаре */}
        <div>
          <p className="text-sm text-gray-500">{product.category.name}</p>
          <h1 className="mt-2 text-3xl font-bold text-[#003366]">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[#003366]">
              {Number(product.price).toFixed(2)} BYN
            </span>
            {product.oldPrice && Number(product.oldPrice) > Number(product.price) && (
              <span className="text-xl text-gray-400 line-through">
                {Number(product.oldPrice).toFixed(2)} BYN
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm">
            {product.inStock ? (
              <span className="flex items-center gap-1 text-green-600">
                <FontAwesomeIcon icon={faCheck} />В наличии
              </span>
            ) : (
              <span className="text-red-600">Нет в наличии</span>
            )}
            {product.sku && <span className="text-gray-400">SKU: {product.sku}</span>}
          </div>

          {/* Размеры */}
          {sizes.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 font-medium">Размер:</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:border-[#003366] hover:text-[#003366]"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Описание */}
          <div className="mt-6">
            <h3 className="mb-2 font-medium">Описание:</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Кнопка в корзину */}
          <div className="mt-8">
            <AddToCartButton productId={product.id} productName={product.name} />
          </div>
        </div>
      </div>
    </div>
  );
}
