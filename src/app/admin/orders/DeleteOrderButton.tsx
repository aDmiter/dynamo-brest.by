'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import ConfirmModal from '@/modules/admin/components/ConfirmModal';

interface DeleteOrderButtonProps {
  orderId: string;
  orderLabel: string;
  redirectTo?: string;
  compact?: boolean;
}

export default function DeleteOrderButton({
  orderId,
  orderLabel,
  redirectTo,
  compact = false,
}: DeleteOrderButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const openModal = () => {
    setErrorMessage(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (loading) return;
    setModalOpen(false);
    setErrorMessage(null);
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(typeof data.error === 'string' ? data.error : 'Не удалось удалить заказ');
        return;
      }

      setModalOpen(false);
      setErrorMessage(null);
      if (redirectTo) {
        router.push(redirectTo);
      }
      router.refresh();
    } catch {
      setErrorMessage('Не удалось удалить заказ. Проверьте соединение и попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={openModal}
          disabled={loading}
          className="inline-flex items-center gap-1 text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
          title="Удалить заказ"
        >
          <FontAwesomeIcon icon={faTrash} />
          Удалить
        </button>
      ) : (
        <button
          type="button"
          onClick={openModal}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faTrash} />
          Удалить заказ
        </button>
      )}

      <ConfirmModal
        isOpen={modalOpen}
        title={errorMessage ? 'Ошибка удаления' : 'Удаление заказа'}
        message={
          errorMessage ??
          `Удалить заказ ${orderLabel}? Данные будут удалены из базы без возможности восстановления.`
        }
        confirmLabel={errorMessage ? 'Закрыть' : 'Удалить'}
        cancelLabel="Отмена"
        onConfirm={errorMessage ? closeModal : handleConfirmDelete}
        onCancel={closeModal}
        loading={loading}
      />
    </>
  );
}
