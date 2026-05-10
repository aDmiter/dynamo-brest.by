// src/app/admin/sponsors/page.tsx - Управление спонсорами
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import DeleteButton from '@/modules/admin/components/DeleteButton';
import ToggleButton from '@/modules/admin/components/ToggleButton';

export default async function SponsorsAdminPage() {
  const sponsors = await prisma.sponsor.findMany({
    orderBy: [{ type: 'asc' }, { order: 'asc' }],
  });

  const typeLabels: Record<string, string> = {
    league: 'Лига',
    general: 'Общий',
    government: 'Гос.',
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-white">Спонсоры</h1>
        <Link href="/admin/sponsors/new">
          <Button size="sm" className="bg-[#ee862c] hover:bg-[#f0ac74]">
            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Добавить
          </Button>
        </Link>
      </div>

      <div className="border border-white/10 bg-white/5 backdrop-blur-sm">
        <table className="w-full">
          <thead className="border-b border-white/10 bg-white/5">
            <tr>
              <th className="p-3 text-left text-sm text-gray-400">Лого</th>
              <th className="p-3 text-left text-sm text-gray-400">Название</th>
              <th className="p-3 text-left text-sm text-gray-400">Тип</th>
              <th className="p-3 text-center text-sm text-gray-400">Активен</th>
              <th className="p-3 text-center text-sm text-gray-400">Действия</th>
            </tr>
          </thead>
          <tbody>
            {sponsors.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  Нет спонсоров
                </td>
              </tr>
            ) : (
              sponsors.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3">
                    <img
                      src={s.imageUrl}
                      alt={s.name}
                      className="h-8 w-auto object-contain opacity-70"
                    />
                  </td>
                  <td className="p-3 text-white">{s.name}</td>
                  <td className="p-3 text-sm text-gray-400">{typeLabels[s.type] || s.type}</td>
                  <td className="p-3 text-center">
                    <ToggleButton
                      id={s.id}
                      apiUrl="/api/sponsors"
                      field="isActive"
                      value={s.isActive}
                      labelOn="Да"
                      labelOff="Нет"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Link
                        href={`/admin/sponsors/${s.id}`}
                        className="text-[#ee862c] hover:underline text-sm"
                      >
                        <FontAwesomeIcon icon={faEdit} /> Ред.
                      </Link>
                      <DeleteButton id={s.id} apiUrl="/api/sponsors" name={s.name} />
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
