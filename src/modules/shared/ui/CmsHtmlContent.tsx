'use client';

import { useLayoutEffect, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import {
  extractGalleryImages,
  parseCmsGalleryAttribute,
  type CmsGalleryImage,
} from '@/lib/cms-gallery';
import TransportPhotoGallery from '@/modules/shared/ui/TransportPhotoGallery';

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

export default function CmsHtmlContent({ html, className }: CmsHtmlContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = ref.current;
    if (!container) return;

    container.innerHTML = html;
    const roots = hydrateGalleries(container);

    return () => {
      roots.forEach((root) => root.unmount());
    };
  }, [html]);

  return <div ref={ref} className={className} suppressHydrationWarning />;
}
