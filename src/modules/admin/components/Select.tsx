// src/modules/admin/components/Select.tsx - Стилизованный select
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

const ADMIN_SELECT_CLASS =
  'w-full rounded-md border border-white/10 bg-white/5 p-2 text-sm text-white';

export default function AdminSelect({ children, className = '', ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`${ADMIN_SELECT_CLASS} ${className}`.trim()}
      style={{ backgroundImage: 'none', colorScheme: 'dark' }}
    >
      {children}
    </select>
  );
}
