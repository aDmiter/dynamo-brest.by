// src/app/admin/countries/page.tsx - Управление странами доставки
import { prisma } from '@/lib/prisma';
import CountriesManager from './CountriesManager';

export default async function CountriesAdminPage() {
  const countries = await prisma.country.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-white mb-8">Страны доставки</h1>
      <CountriesManager countries={countries} />
    </div>
  );
}
