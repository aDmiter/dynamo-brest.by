import {
  ADMIN_SECTIONS,
  ADMIN_SECTION_IDS,
  ALL_ADMIN_SECTION_IDS,
  type AdminSectionId,
} from '@/config/admin-sections';
import type { Session } from 'next-auth';

export const SUPERADMIN_ROLE = 'superadmin';

export type AdminSessionUser = {
  id?: string;
  role?: string;
  permissions?: string[];
};

export function parseAdminPermissions(value: unknown): AdminSectionId[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is AdminSectionId =>
    ADMIN_SECTION_IDS.includes(id as AdminSectionId)
  );
}

export function isSuperAdmin(role?: string | null): boolean {
  return role === SUPERADMIN_ROLE;
}

export function getSessionPermissions(user?: AdminSessionUser | null): AdminSectionId[] {
  if (!user) return [];
  if (isSuperAdmin(user.role)) return ALL_ADMIN_SECTION_IDS;
  return parseAdminPermissions(user.permissions);
}

export function canAccessSection(
  user: AdminSessionUser | null | undefined,
  sectionId: AdminSectionId
): boolean {
  return getSessionPermissions(user).includes(sectionId);
}

export function canAccessAdminPath(
  user: AdminSessionUser | null | undefined,
  pathname: string
): boolean {
  const normalized = pathname.split('?')[0];
  if (normalized === '/admin/login') return true;
  if (normalized === '/admin/no-access') return Boolean(user);
  if (normalized === '/admin/settings/users') {
    return isSuperAdmin(user?.role);
  }

  for (const section of ADMIN_SECTIONS) {
    for (const prefix of section.pathPrefixes) {
      if (normalized === prefix || normalized.startsWith(prefix + '/')) {
        return canAccessSection(user, section.id);
      }
    }
  }

  if (normalized === '/admin') return getSessionPermissions(user).length > 0;
  return false;
}

export function getFirstAllowedAdminPath(user: AdminSessionUser | null | undefined): string {
  const permissions = getSessionPermissions(user);
  if (permissions.includes('dashboard')) return '/admin/dashboard';
  const first = ADMIN_SECTIONS.find((s) => permissions.includes(s.id));
  return first?.pathPrefixes[0] ?? '/admin/no-access';
}

export type AdminAuthSession = Session;
