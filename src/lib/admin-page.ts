import { auth } from '@/lib/auth';
import { isSuperAdmin } from '@/lib/admin-permissions';

export async function getAdminPageFlags() {
  const session = await auth();
  return {
    showAudit: isSuperAdmin(session?.user?.role),
  };
}
