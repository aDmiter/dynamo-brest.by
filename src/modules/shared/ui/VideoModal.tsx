// src/modules/shared/ui/VideoModal.tsx - Модальное окно для просмотра YouTube видео
'use client';

import { useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import YouTube from 'react-youtube';

interface VideoModalProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoModal({ videoId, isOpen, onClose }: VideoModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="video-modal fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Затемнение */}
      <div
        className="video-modal__overlay absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Контент */}
      <div className="video-modal__content relative z-10 w-full max-w-[900px] border border-white/10 bg-[#242C41]/60 backdrop-blur-xl shadow-2xl">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="video-modal__close absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center border border-white/20 bg-[#242C41] text-white/70 transition-colors hover:border-[#ee862c] hover:text-[#ee862c] z-20"
        >
          <FontAwesomeIcon icon={faTimes} className="text-lg" />
        </button>

        {/* Плеер */}
        <div className="video-modal__player aspect-video w-full">
          <YouTube
            videoId={videoId}
            opts={{
              width: '100%',
              height: '100%',
              playerVars: {
                autoplay: 1,
                rel: 0,
                modestbranding: 1,
              },
            }}
            className="h-full w-full"
            iframeClassName="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
