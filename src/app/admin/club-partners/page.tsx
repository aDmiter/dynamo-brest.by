import ClubPartnersAdmin from '@/modules/admin/components/ClubPartnersAdmin';

export const dynamic = 'force-dynamic';

export default function AdminClubPartnersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-white">Партнёры клуба</h1>
        <p className="mt-2 text-sm text-gray-400">
          Логотипы для страницы /club/partners: титульные спонсоры, генеральный партнёр и партнёры.
        </p>
      </div>
      <ClubPartnersAdmin />
    </div>
  );
}
