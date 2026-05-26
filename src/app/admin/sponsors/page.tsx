// src/app/admin/sponsors/page.tsx - Управление спонсорами
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import SponsorsAdminList from './SponsorsAdminList';

export default async function SponsorsAdminPage() {
  const sponsors = await prisma.sponsor.findMany({
    orderBy: [{ type: 'asc' }, { order: 'asc' }],
  });

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

      <SponsorsAdminList initialSponsors={sponsors} />
    </div>
  );
}
