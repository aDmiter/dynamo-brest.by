import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import DeleteButton from '@/modules/admin/components/DeleteButton';

export default async function ManufacturersAdminPage() {
  const manufacturers = await prisma.productmanufacturer.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { product: true } } },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-white">Производители</h1>
        <Link href="/admin/manufacturers/new">
          <Button size="sm" className="bg-[#ee862c] hover:bg-[#f0ac74]">
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Добавить
          </Button>
        </Link>
      </div>

      <div className="border border-white/10 bg-white/5 backdrop-blur-sm">
        <table className="w-full">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="p-3 text-left text-sm text-gray-400">#</th>
              <th className="p-3 text-left text-sm text-gray-400">Название</th>
              <th className="p-3 text-center text-sm text-gray-400">Товаров</th>
              <th className="p-3 text-center text-sm text-gray-400">Действия</th>
            </tr>
          </thead>
          <tbody>
            {manufacturers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  Нет производителей
                </td>
              </tr>
            ) : (
              manufacturers.map((m, index) => (
                <tr
                  key={m.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-3 text-sm text-gray-500">{index + 1}</td>
                  <td className="p-3 text-white font-medium">{m.name}</td>
                  <td className="p-3 text-center text-sm text-gray-400">{m._count.product}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-3">
                      <Link
                        href={`/admin/manufacturers/${m.id}`}
                        className="text-sm text-[#ee862c] hover:underline"
                      >
                        <FontAwesomeIcon icon={faEdit} /> Ред.
                      </Link>
                      <DeleteButton id={m.id} apiUrl="/api/manufacturers" name={m.name} />
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
