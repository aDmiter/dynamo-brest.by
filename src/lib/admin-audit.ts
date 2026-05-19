import type { AdminSessionUser } from '@/lib/admin-permissions';

export type AdminAuditRecord = {
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdByName?: string | null;
  updatedByName?: string | null;
};

export function getAdminActorLabel(user: AdminSessionUser): string {
  const name = user.name?.trim();
  if (name) return name;
  if (user.email) return user.email;
  return user.id ?? '—';
}

export function adminAuditOnCreate(user: AdminSessionUser) {
  const label = getAdminActorLabel(user);
  return {
    createdByAdminId: user.id ?? null,
    createdByName: label,
    updatedByAdminId: user.id ?? null,
    updatedByName: label,
  };
}

export function adminAuditOnUpdate(user: AdminSessionUser) {
  const label = getAdminActorLabel(user);
  return {
    updatedByAdminId: user.id ?? null,
    updatedByName: label,
  };
}

export function formatAdminAuditDate(value: Date | string | undefined): string {
  if (!value) return '—';
  const date = typeof value === 'string' ? new Date(value) : value;
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
