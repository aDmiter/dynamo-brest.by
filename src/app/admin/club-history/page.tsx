import type { Metadata } from 'next';
import { getAdminPageFlags } from '@/lib/admin-page';
import ClubHistoryAdmin from '@/modules/admin/components/ClubHistoryAdmin';

export const metadata: Metadata = {
  title: 'История клуба | Админ-панель',
};

export default async function ClubHistoryAdminPage() {
  const { showAudit } = await getAdminPageFlags();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-white">История клуба</h1>
      <ClubHistoryAdmin showAudit={showAudit} />
    </div>
  );
}
