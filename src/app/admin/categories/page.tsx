// src/app/admin/categories/page.tsx - Управление категориями товаров
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faImage } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import DeleteButton from '@/modules/admin/components/DeleteButton';

export default async function CategoriesAdminPage() {
  const categories = await prisma.productcategory.findMany({
    orderBy: { order: 'asc' },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-white">Категории товаров</h1>
        <Link href="/admin/categories/new">
          <Button size="sm" className="bg-[#ee862c] hover:bg-[#f0ac74]">
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Добавить категорию
          </Button>
        </Link>
      </div>

      <div className="border border-white/10 bg-white/5 backdrop-blur-sm">
        <table className="w-full">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="p-3 text-left text-sm text-gray-400">#</th>
              <th className="p-3 text-left text-sm text-gray-400">Изображение</th>
              <th className="p-3 text-left text-sm text-gray-400">Название</th>
              <th className="p-3 text-left text-sm text-gray-400">Slug</th>
              <th className="p-3 text-center text-sm text-gray-400">Порядок</th>
              <th className="p-3 text-center text-sm text-gray-400">Действия</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  Нет категорий
                </td>
              </tr>
            ) : (
              categories.map((cat, index) => (
                <tr
                  key={cat.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-3 text-sm text-gray-500">{index + 1}</td>
                  <td className="p-3">
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} className="h-8 w-8 object-cover" />
                    ) : (
                      <FontAwesomeIcon icon={faImage} className="text-gray-600" />
                    )}
                  </td>
                  <td className="p-3 text-white font-medium">{cat.name}</td>
                  <td className="p-3 text-sm text-gray-400">{cat.slug}</td>
                  <td className="p-3 text-center text-sm text-white">{cat.order}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-3">
                      <Link
                        href={`/admin/categories/${cat.id}`}
                        className="text-sm text-[#ee862c] hover:underline"
                      >
                        <FontAwesomeIcon icon={faEdit} /> Ред.
                      </Link>
                      <DeleteButton id={cat.id} apiUrl="/api/categories" name={cat.name} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
