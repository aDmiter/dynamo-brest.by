'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import ConfirmModal from '@/modules/admin/components/ConfirmModal';

type SyncStep = {
  step: string;
  label: string;
  success: boolean;
  message: string;
};

type SyncResponse = {
  success: boolean;
  steps: SyncStep[];
  durationSeconds: string;
  error?: string;
};

export default function AdminCometSyncButton() {
  const [showModal, setShowModal] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResponse | null>(null);
  const [showPanel, setShowPanel] = useState(false);

  const handleSync = async () => {
    setShowModal(false);
    setSyncing(true);
    setResult(null);
    setShowPanel(true);

    try {
      const res = await fetch('/api/sync/comet', { method: 'POST' });
      const data = (await res.json()) as SyncResponse & { error?: string };
      if (!res.ok) {
        setResult({
          success: false,
          steps: [],
          durationSeconds: '0',
          error: data.error || 'Ошибка синхронизации',
        });
      } else {
        setResult(data);
      }
    } catch {
      setResult({
        success: false,
        steps: [],
        durationSeconds: '0',
        error: 'Ошибка соединения',
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        disabled={syncing}
        className="inline-flex items-center gap-2 rounded border border-[#ee862c]/30 bg-[#ee862c]/10 px-4 py-2 text-sm font-medium text-[#ee862c] transition-colors hover:border-[#ee862c]/50 hover:bg-[#ee862c]/20 disabled:opacity-50"
      >
        <FontAwesomeIcon icon={faSync} className={syncing ? 'animate-spin' : ''} />
        {syncing ? 'Синхронизация…' : 'Синхронизация COMET'}
      </button>

      <ConfirmModal
        isOpen={showModal}
        title="Синхронизация COMET"
        message="Будут по очереди обновлены: матчи и клубы, протоколы, тренеры, игроки. У существующих тренеров должность и фото в базе не меняются. Может занять несколько минут."
        confirmLabel="Запустить"
        onConfirm={handleSync}
        onCancel={() => setShowModal(false)}
        loading={syncing}
      />

      {showPanel && (syncing || result) && (
        <div className="fixed bottom-6 right-6 z-[100] w-full max-w-md border border-white/15 bg-[#242C41]/98 p-4 shadow-2xl backdrop-blur-xl">
          <div className="mb-3 flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-white">
              {syncing ? 'Синхронизация COMET…' : result?.success ? 'Синхронизация завершена' : 'Синхронизация с ошибками'}
            </p>
            {!syncing && (
              <button
                type="button"
                onClick={() => {
                  setShowPanel(false);
                  setResult(null);
                }}
                className="text-xs text-gray-400 hover:text-white"
              >
                Закрыть
              </button>
            )}
          </div>

          {syncing && (
            <p className="text-xs text-gray-400">Матчи → протоколы → тренеры → игроки</p>
          )}

          {result?.error && !result.steps.length && (
            <p className="mt-2 text-sm text-red-400">{result.error}</p>
          )}

          {result?.steps && result.steps.length > 0 && (
            <ul className="mt-2 space-y-1.5 text-xs">
              {result.steps.map((step) => (
                <li
                  key={step.step}
                  className={step.success ? 'text-green-400' : 'text-red-400'}
                >
                  {step.success ? '✅' : '❌'} {step.label}: {step.message}
                </li>
              ))}
            </ul>
          )}

          {result && !syncing && (
            <p className="mt-3 text-xs text-gray-500">Время: {result.durationSeconds} с</p>
          )}
        </div>
      )}
    </>
  );
}
