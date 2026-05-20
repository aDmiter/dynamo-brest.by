// src/app/admin/shop/fields/PlayersManager.tsx — список игроков для полного нанесения (из БД состава)
'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faSync } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface Player {
  id: string;
  name: string;
  number: number;
}

export default function PlayersManager({ players }: { players: Player[] }) {
  const router = useRouter();

  return (
    <div className="border border-white/10 bg-white/5 backdrop-blur-sm p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-400 max-w-xl">
          Список формируется автоматически из основного состава (COMET {68812}): номер и фамилия
          из базы игроков, без вратарей. Обновите состав через синхронизацию COMET и нажмите
          «Обновить список».
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => router.refresh()}
          className="border-white/10 text-gray-300 shrink-0"
        >
          <FontAwesomeIcon icon={faSync} className="mr-2" />
          Обновить список
        </Button>
      </div>

      <table className="w-full">
        <thead className="border-b border-white/10">
          <tr>
            <th className="p-2 text-left text-sm text-gray-400 w-12">#</th>
            <th className="p-2 text-left text-sm text-gray-400">Фамилия</th>
            <th className="p-2 text-left text-sm text-gray-400">Номер</th>
          </tr>
        </thead>
        <tbody>
          {players.length === 0 ? (
            <tr>
              <td colSpan={3} className="p-4 text-center text-gray-500">
                Нет игроков. Проверьте синхронизацию основного состава и наличие номеров у
                игроков.
              </td>
            </tr>
          ) : (
            players.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="p-2 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-[#ee862c]/20 text-[#ee862c] text-sm font-bold">
                    {p.number}
                  </span>
                </td>
                <td className="p-2 text-white text-sm flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faShieldHalved}
                    className="text-gray-600 text-xs shrink-0"
                  />
                  {p.name}
                </td>
                <td className="p-2 text-sm text-gray-400">{p.number}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {players.length > 0 && (
        <p className="mt-3 text-xs text-gray-500">Всего: {players.length}</p>
      )}
    </div>
  );
}
