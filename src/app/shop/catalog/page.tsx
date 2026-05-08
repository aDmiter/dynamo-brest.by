// src/app/shop/catalog/page.tsx - Каталог товаров
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';

export default async function CatalogPage() {
  const categories = await prisma.productCategory.findMany({
    orderBy: { order: 'asc' },
    include: {
      products: {
        where: { inStock: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const allProducts = await prisma.product.findMany({
    where: { inStock: true },
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-[#003366]">Каталог товаров</h1>

      {allProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-500">Товаров пока нет</p>
          <p className="mt-2 text-gray-400">Добавьте товары через админ-панель</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {allProducts.map((product) => {
            const images = product.images ? JSON.parse(product.images) : [];
            const firstImage = images.length > 0 ? images[0] : null;

            return (
              <Link
                key={product.id}
                href={`/shop/product/${product.slug}`}
                className="group rounded-xl bg-white shadow-md transition-shadow hover:shadow-lg overflow-hidden"
              >
                {/* Изображение */}
                <div className="relative h-48 bg-gray-100">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-400">
                      <FontAwesomeIcon icon={faShoppingCart} className="text-4xl" />
                    </div>
                  )}
                </div>

                {/* Информация */}
                <div className="p-4">
                  <h3 className="font-medium text-[#003366] group-hover:underline line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">{product.category.name}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-bold text-[#003366]">
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
    </div>
  );
}
