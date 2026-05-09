// src/modules/shared/ui/VideoSection.tsx - Секция YouTube видео
'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faArrowRight, faEye } from '@fortawesome/free-solid-svg-icons';
import VideoModal from './VideoModal';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  views?: string;
}

function formatViews(views: string): string {
  const num = parseInt(views);
  if (isNaN(num)) return '';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export default function VideoSection() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/youtube')
      .then((res) => res.json())
      .then((data) => {
        if (data.videos) setVideos(data.videos);
      })
      .catch(console.error);
  }, []);

  return (
    <>
      <section
        className="video-section relative flex min-h-screen items-center overflow-hidden"
        style={{
          background:
            'radial-gradient(45% 50% at 50% 50%, #1D3A6B 0.01%, rgba(36, 44, 65, 0) 100%)',
          backgroundBlendMode: 'screen',
          backgroundColor: '#242C41',
        }}
      >
        <div className="video-section__container relative z-10 mx-auto w-full max-w-[800px] px-4 py-16 md:px-6">
          {/* Заголовок */}
          <div className="video-section__header mb-12 text-center">
            <h2
              className="video-section__title text-3xl font-bold text-white md:text-5xl"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
            >
              Будь первым с <span className="text-[#ee862c]">FCDBTV</span>
            </h2>
          </div>

          {/* Сетка видео */}
          {videos.length === 0 ? (
            <div className="video-section__empty py-20 text-center text-gray-500">
              <p className="text-xl">Загрузка видео...</p>
            </div>
          ) : (
            <div className="video-section__grid grid grid-cols-2 gap-6 md:gap-8">
              {videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => setActiveVideoId(video.id)}
                  className="video-section__card group block w-full text-left"
                >
                  {/* Стеклянный контейнер */}
                  <div className="flex h-full flex-col border border-white/10 bg-white/5 backdrop-blur-md p-3 transition-all duration-300 hover:border-[#ee862c]/20 hover:bg-white/[0.07] hover:shadow-2xl hover:shadow-[#ee862c]/5">
                    {/* Превью */}
                    <div className="video-section__thumbnail relative aspect-video overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                        <div className="flex h-10 w-10 items-center justify-center border-2 border-white/80 text-white/80 opacity-0 transition-all group-hover:opacity-100 scale-75 group-hover:scale-100">
                          <FontAwesomeIcon icon={faPlay} className="text-sm" />
                        </div>
                      </div>
                    </div>

                    {/* Информация */}
                    <div className="video-section__info mt-3 flex flex-1 flex-col">
                      <h3
                        className="video-section__video-title text-xs font-bold text-white md:text-sm line-clamp-2 leading-tight transition-colors group-hover:text-[#ee862c]"
                        style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
                      >
                        {video.title}
                      </h3>
                      {video.views && (
                        <p className="video-section__views mt-auto flex items-center gap-1 pt-2 text-[10px] text-gray-500">
                          <FontAwesomeIcon icon={faEye} className="text-[8px]" />
                          {formatViews(video.views)}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Кнопка "Все видео" */}
          <div className="video-section__footer mt-10 text-center">
            <a
              href="https://www.youtube.com/@dynamobrest"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border border-white/20 px-8 py-4 text-xs font-bold uppercase tracking-wider text-white transition-all hover:border-[#ee862c] hover:text-[#ee862c] hover:bg-white/5 hover:backdrop-blur-md"
            >
              Все видео
              <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
            </a>
          </div>
        </div>

        {/* Заголовок модуля — левый нижний угол */}
        <div className="video-section__title-module absolute left-0 bottom-0 pointer-events-none select-none">
          <span
            className="block text-[60px] font-black uppercase tracking-[0.1em] text-white/[0.07] md:text-[100px] leading-none"
            style={{
              writingMode: 'vertical-lr',
              transform: 'rotate(180deg)',
              fontFamily: "'Inter Tight', sans-serif",
              fontWeight: 900,
            }}
          >
            FCDBTV
          </span>
        </div>
      </section>

      {/* Модальное окно */}
      <VideoModal
        videoId={activeVideoId || ''}
        isOpen={!!activeVideoId}
        onClose={() => setActiveVideoId(null)}
      />
    </>
  );
}
