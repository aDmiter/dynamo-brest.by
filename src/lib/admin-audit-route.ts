import { auth } from '@/lib/auth';
import { adminAuditOnCreate, adminAuditOnUpdate } from '@/lib/admin-audit';
import type { AdminSessionUser } from '@/lib/admin-permissions';

export async function getAdminActor(): Promise<AdminSessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user as AdminSessionUser;
}

export async function auditCreateData() {
  const user = await getAdminActor();
  return user ? adminAuditOnCreate(user) : {};
}

export async function auditUpdateData() {
  const user = await getAdminActor();
  return user ? adminAuditOnUpdate(user) : {};
}
