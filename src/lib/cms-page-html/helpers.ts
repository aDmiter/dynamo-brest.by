import { escapeHtml } from '@/lib/html';
import { buildCmsGalleryHtml } from '@/lib/cms-gallery';

export function wrapCmsPageContent(inner: string): string {
  return `<div class="cms-page-content transport-services">${inner}</div>`;
}

export function galleryHtml(images: { src: string; alt: string }[]): string {
  return buildCmsGalleryHtml(images);
}

export function placeholderHtml(lead: string): string {
  return wrapCmsPageContent(`<p class="transport-services__lead">${escapeHtml(lead)}</p>`);
}

export function dividerHtml(): string {
  return '<div class="transport-services__divider"></div>';
}

export function sectionHtml(id: string, title: string, body: string): string {
  return `<section class="transport-services__vehicle" aria-labelledby="${escapeHtml(id)}">
<h2 id="${escapeHtml(id)}" class="transport-services__vehicle-title">${escapeHtml(title)}</h2>
${body}
</section>`;
}
