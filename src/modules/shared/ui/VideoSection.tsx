// src/modules/shared/ui/VideoSection.tsx - Секция YouTube видео
'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faEye } from '@fortawesome/free-solid-svg-icons';
import VideoModal from './VideoModal';
import HomeSectionHeader from './HomeSectionHeader';

const FCDBTV_YOUTUBE_URL = 'https://www.youtube.com/@dynamobrest';

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
        className="video-section"
        style={{
          background: 'var(--color-bg-main)',
          fontFamily: "'Inter Tight', sans-serif",
        }}
        aria-labelledby="home-video-title"
      >
        <div className="home-section-inner">
          <HomeSectionHeader
            title="Видео"
            watermark="FCDBTV"
            linkHref={FCDBTV_YOUTUBE_URL}
            linkLabel="Все видео"
            titleId="home-video-title"
            variant="dark"
            external
          />

          <div className="video-section__content">
            {videos.length === 0 ? (
              <div className="video-section__empty">
                <p>Загрузка видео...</p>
              </div>
            ) : (
              <div className="video-section__grid">
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
          </div>
        </div>

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
