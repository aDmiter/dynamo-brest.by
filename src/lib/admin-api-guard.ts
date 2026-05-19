import {
  isSuperAdminOnlyApi,
  resolveAdminApiSection,
  type AdminApiAccess,
} from '@/config/admin-api-routes';
import { canAccessSection, isSuperAdmin, type AdminSessionUser } from '@/lib/admin-permissions';

export type { AdminApiAccess };

export function checkAdminApiRequest(
  pathname: string,
  method: string,
  user: AdminSessionUser | null | undefined
): AdminApiAccess {
  if (!pathname.startsWith('/api/')) return 'public';

  if (pathname === '/api/upload' && method.toUpperCase() === 'POST') {
    return user?.id ? 'ok' : 'unauthorized';
  }

  const section = resolveAdminApiSection(pathname, method);
  if (!section) {
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
    if (isMutation && pathname.startsWith('/api/')) {
      return user ? 'ok' : 'unauthorized';
    }
    return 'public';
  }

  if (!user?.id) return 'unauthorized';

  if (isSuperAdminOnlyApi(pathname) && !isSuperAdmin(user.role)) {
    return 'forbidden';
  }

  if (!canAccessSection(user, section)) {
    return 'forbidden';
  }

  return 'ok';
}
