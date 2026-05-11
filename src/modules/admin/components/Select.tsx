// src/modules/admin/components/Select.tsx - Стилизованный select
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export default function AdminSelect({ children, className = '', ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={`w-full border border-white/10 bg-white/5 p-2 text-sm text-white ${className}`}
      style={{ backgroundImage: 'none' }}
    >
      {children}
    </select>
  );
}
