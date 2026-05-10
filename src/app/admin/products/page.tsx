// src/app/admin/products/page.tsx - Управление товарами
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import DeleteButton from '@/modules/admin/components/DeleteButton';

export default async function ProductsAdminPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { productcategory: true },
    take: 50,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-white">Товары</h1>
        <Link href="/admin/products/new">
          <Button size="sm" className="bg-[#ee862c] hover:bg-[#f0ac74]">
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Добавить товар
          </Button>
        </Link>
      </div>

      <div className="border border-white/10 bg-white/5 backdrop-blur-sm">
        <table className="w-full">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="p-3 text-left text-sm text-gray-400">Фото</th>
              <th className="p-3 text-left text-sm text-gray-400">Название</th>
              <th className="p-3 text-left text-sm text-gray-400">Артикул</th>
              <th className="p-3 text-left text-sm text-gray-400">Цена</th>
              <th className="p-3 text-left text-sm text-gray-400">Категория</th>
              <th className="p-3 text-center text-sm text-gray-400">Действия</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  Нет товаров
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const images: string[] = p.images ? JSON.parse(p.images) : [];
                return (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3">
                      {images[0] ? (
                        <img src={images[0]} alt={p.name} className="h-10 w-10 object-cover" />
                      ) : (
                        <div className="h-10 w-10 bg-white/5" />
                      )}
                    </td>
                    <td className="p-3 text-white">{p.name}</td>
                    <td className="p-3 text-sm text-gray-400">{p.article || '—'}</td>
                    <td className="p-3 text-sm text-white">{Number(p.price).toFixed(2)} BYN</td>
                    <td className="p-3 text-sm text-gray-400">{p.productcategory?.name || '—'}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="text-[#ee862c] hover:underline text-sm"
                        >
                          <FontAwesomeIcon icon={faEdit} /> Ред.
                        </Link>
                        <DeleteButton id={p.id} apiUrl="/api/products" name={p.name} />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
