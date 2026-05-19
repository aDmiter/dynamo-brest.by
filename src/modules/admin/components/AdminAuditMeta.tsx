import { formatAdminAuditDate, type AdminAuditRecord } from '@/lib/admin-audit';

interface Props {
  record: AdminAuditRecord;
  showCreated?: boolean;
  className?: string;
}

export default function AdminAuditMeta({ record, showCreated = true, className = '' }: Props) {
  const hasCreated = Boolean(record.createdByName);
  const hasUpdated = Boolean(record.updatedByName);

  if (!hasCreated && !hasUpdated && !record.createdAt && !record.updatedAt) {
    return null;
  }

  return (
    <div
      className={`rounded border border-white/10 bg-white/5 px-4 py-3 text-xs text-gray-400 space-y-1 ${className}`}
    >
      <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">Журнал изменений</p>
      {showCreated && (
        <p>
          <span className="text-gray-500">Создано:</span>{' '}
          {record.createdByName ?? '—'}
          {record.createdAt ? ` · ${formatAdminAuditDate(record.createdAt)}` : ''}
        </p>
      )}
      <p>
        <span className="text-gray-500">Изменено:</span>{' '}
        {record.updatedByName ?? record.createdByName ?? '—'}
        {record.updatedAt ? ` · ${formatAdminAuditDate(record.updatedAt)}` : ''}
      </p>
    </div>
  );
}
