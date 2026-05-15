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
          background: 'var(--color-bg-main)',
          fontFamily: "'Inter Tight', sans-serif",
        }}
      >
        <div className="video-section__container relative z-10 mx-auto w-full max-w-[800px] px-4 py-16 md:px-6">
          {/* Заголовок */}
          <div className="video-section__header mb-12 text-center">
            <h2
              className="video-section__title text-3xl font-bold text-white md:text-5xl"
              style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 900 }}
            >
              Будь первым с <span style={{ color: 'var(--color-accent)' }}>FCDBTV</span>
            </h2>
          </div>

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
                  <div
                    className="flex h-full flex-col overflow-hidden transition-all duration-300"
                    style={{
                      borderRadius: 16,
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-card)',
                      boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.transform = 'translateY(-4px)';
                      el.style.borderColor = 'var(--color-accent-30)';
                      el.style.boxShadow =
                        '0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px var(--color-accent-20)';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLDivElement;
                      el.style.transform = 'translateY(0)';
                      el.style.borderColor = 'var(--color-border)';
                      el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.35)';
                    }}
                  >
                    {/* Превью */}
                    <div className="video-section__thumbnail relative aspect-video overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                        <div
                          style={{
                            display: 'flex',
                            width: 48,
                            height: 48,
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid rgba(255,255,255,0.8)',
                            borderRadius: '50%',
                            color: 'rgba(255,255,255,0.8)',
                            opacity: 0,
                            transition: 'all 0.3s ease',
                            transform: 'scale(0.9)',
                          }}
                          className="group-hover:opacity-100 group-hover:scale-100"
                        >
                          <FontAwesomeIcon icon={faPlay} className="text-sm" />
                        </div>
                      </div>
                    </div>

                    {/* Информация */}
                    <div
                      className="video-section__info p-4"
                      style={{ background: 'var(--color-bg-main)' }}
                    >
                      <h3
                        className="video-section__video-title line-clamp-2 transition-colors group-hover:text-[var(--color-accent)]"
                        style={{
                          fontFamily: "'Inter Tight', sans-serif",
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#ffffff',
                          letterSpacing: '-0.02em',
                          lineHeight: 1.3,
                          textTransform: 'uppercase',
                        }}
                      >
                        {video.title}
                      </h3>
                      <div
                        style={{
                          height: 1,
                          width: 24,
                          background:
                            'linear-gradient(to right, var(--color-accent-30), transparent)',
                          marginTop: 8,
                          marginBottom: 8,
                        }}
                      />
                      {video.views && (
                        <p
                          className="video-section__views flex items-center gap-1.5"
                          style={{
                            fontFamily: "'Inter Tight', sans-serif",
                            fontSize: 10,
                            fontWeight: 600,
                            color: 'var(--color-text-label)',
                          }}
                        >
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
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'transparent',
                border: '1.5px solid rgba(255,255,255,0.2)',
                borderRadius: 8,
                padding: '10px 24px',
                color: 'rgba(255,255,255,0.7)',
                fontFamily: "'Inter Tight', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                const t = e.currentTarget as HTMLAnchorElement;
                t.style.borderColor = 'var(--color-accent)';
                t.style.color = 'var(--color-accent)';
                t.style.background = 'var(--color-accent-7)';
              }}
              onMouseLeave={(e) => {
                const t = e.currentTarget as HTMLAnchorElement;
                t.style.borderColor = 'rgba(255,255,255,0.2)';
                t.style.color = 'rgba(255,255,255,0.7)';
                t.style.background = 'transparent';
              }}
            >
              Все видео
              <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
            </a>
          </div>
        </div>

        {/* Заголовок модуля — левый нижний угол */}
        <div className="video-section__title-module absolute left-0 bottom-0 pointer-events-none select-none">
          <span
            className="block text-[60px] font-black uppercase tracking-[0.1em] md:text-[100px] leading-none"
            style={{
              writingMode: 'vertical-lr',
              transform: 'rotate(180deg)',
              fontFamily: "'Inter Tight', sans-serif",
              fontWeight: 900,
              color: 'var(--color-team-names)',
              opacity: 0.07,
            }}
          >
            FCDBTV
          </span>
        </div>
      </section>

      <VideoModal
        videoId={activeVideoId || ''}
        isOpen={!!activeVideoId}
        onClose={() => setActiveVideoId(null)}
      />
    </>
  );
}
