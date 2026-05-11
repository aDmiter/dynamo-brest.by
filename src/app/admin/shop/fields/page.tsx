// src/app/admin/shop/fields/page.tsx - Доп. поля (нанесения)
import { prisma } from '@/lib/prisma';
import CustomizationsManager from './CustomizationsManager';
import PlayersManager from './PlayersManager';

export default async function FieldsAdminPage() {
  const customizations = await prisma.customization.findMany({
    orderBy: { order: 'asc' },
  });

  const players = await prisma.playerCustomization.findMany({
    orderBy: { number: 'asc' },
  });

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white mb-8">Дополнительные поля</h1>
      </div>

      {/* Нанесения (логотипы, флаги) */}
      <div>
        <h2 className="font-heading text-xl font-bold text-white mb-6">Элементы нанесения</h2>
        <CustomizationsManager customizations={customizations} />
      </div>

      {/* Игроки для нанесения */}
      <div>
        <h2 className="font-heading text-xl font-bold text-white mb-6">
          Игроки (для полного нанесения)
        </h2>
        <PlayersManager players={players} />
      </div>
    </div>
  );
}
