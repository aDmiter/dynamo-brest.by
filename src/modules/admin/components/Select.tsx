// src/modules/admin/components/Select.tsx - Стилизованный select
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export default function AdminSelect({ children, className = '', ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`w-full rounded-md border border-slate-300 bg-slate-100 p-2 text-sm text-slate-900 shadow-sm ${className}`}
      style={{ backgroundImage: 'none', colorScheme: 'light' }}
    >
      {children}
    </select>
  );
}
