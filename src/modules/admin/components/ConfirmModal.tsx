// src/modules/admin/components/ConfirmModal.tsx - Модальное окно подтверждения (glassmorphism)
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={loading ? undefined : onCancel}
      />

      <div className="relative z-10 w-full max-w-md border border-white/10 bg-[#242C41]/95 backdrop-blur-xl p-8 shadow-2xl">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faTimes} className="text-lg" />
        </button>

        <h3
          id="confirm-modal-title"
          className="font-heading text-xl font-bold text-white mb-3"
          style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
        >
          {title}
        </h3>

        <p className="text-sm text-gray-400 leading-relaxed mb-8">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-medium text-gray-400 border border-white/10 hover:text-white hover:border-white/30 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-bold uppercase tracking-wider bg-[#ee862c] text-white hover:bg-[#f0ac74] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Выполняется...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
