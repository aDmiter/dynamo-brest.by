'use client';

import { useLayoutEffect, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  extractGalleryImages,
  parseCmsGalleryAttribute,
  type CmsGalleryImage,
} from '@/lib/cms-gallery';
import {
  buildYoutubeIframeHtml,
  resolveCmsYoutubeVideoId,
} from '@/lib/youtube-embed';
import { normalizeCmsListElements } from '@/lib/cms-html-normalize';
import { parseCmsStandingsEmbed } from '@/lib/cms-standings';
import CmsStandingsEmbed from '@/modules/news/components/CmsStandingsEmbed';
import TransportPhotoGallery from '@/modules/shared/ui/TransportPhotoGallery';
import '@/styles/cms-html-content.scss';

interface CmsHtmlContentProps {
  html: string;
  className?: string;
}

function hydrateGalleries(container: HTMLElement): Root[] {
  const roots: Root[] = [];

  const mountGallery = (target: Element, images: CmsGalleryImage[]) => {
    if (images.length === 0) return;
    const mountPoint = document.createElement('div');
    target.replaceWith(mountPoint);
    const root = createRoot(mountPoint);
    root.render(<TransportPhotoGallery images={images} />);
    roots.push(root);
  };

  container.querySelectorAll('.cms-gallery[data-cms-gallery]').forEach((el) => {
    const images = parseCmsGalleryAttribute(el.getAttribute('data-cms-gallery'));
    mountGallery(el, images);
  });

  container.querySelectorAll('.transport-services__gallery').forEach((el) => {
    if (el.closest('.cms-gallery')) return;
    mountGallery(el, extractGalleryImages(el));
  });

  return roots;
}

function hydrateStandingsEmbeds(container: HTMLElement): Root[] {
  const roots: Root[] = [];

  container.querySelectorAll('.cms-standings-embed[data-cms-standings]').forEach((el) => {
    const cometId = parseCmsStandingsEmbed(el);
    if (!cometId) return;

    const mountPoint = document.createElement('div');
    el.replaceWith(mountPoint);
    const root = createRoot(mountPoint);
    root.render(<CmsStandingsEmbed cometId={cometId} />);
    roots.push(root);
  });

  return roots;
}

function hydrateYoutubeEmbeds(container: HTMLElement): void {
  container.querySelectorAll('.cms-youtube-embed').forEach((el) => {
    const videoId = resolveCmsYoutubeVideoId(el);
    if (!videoId) return;

    const iframeHtml = buildYoutubeIframeHtml(videoId);
    if (!iframeHtml) return;

    el.setAttribute('data-cms-youtube', videoId);
    el.innerHTML = iframeHtml;
  });
}

export default function CmsHtmlContent({ html, className }: CmsHtmlContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;

    container.innerHTML = html;
    normalizeCmsListElements(container);
    hydrateYoutubeEmbeds(container);
    const galleryRoots = hydrateGalleries(container);
    const standingsRoots = hydrateStandingsEmbeds(container);

    return () => {
      [...galleryRoots, ...standingsRoots].forEach((root) => root.unmount());
    };
  }, [html]);

  const mergedClassName = ['cms-html-content', className].filter(Boolean).join(' ');

  return <div ref={ref} className={mergedClassName} suppressHydrationWarning />;
}
