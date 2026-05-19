import { escapeHtml } from '@/lib/html';

export type CmsGalleryImage = {
  src: string;
  alt: string;
};

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;');
}

/** HTML галереи для CMS-редактора и фронта (лайтбокс подключается через CmsHtmlContent) */
export function buildCmsGalleryHtml(images: CmsGalleryImage[]): string {
  if (images.length === 0) return '';

  const preview = images
    .map(
      (img) =>
        `<span class="transport-services__gallery-item"><img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}" loading="lazy" /></span>`,
    )
    .join('');

  return `<div class="cms-gallery" data-cms-gallery="${escapeAttr(JSON.stringify(images))}" contenteditable="false"><div class="transport-services__gallery">${preview}</div></div>`;
}

/** Извлечь фото из legacy-разметки (ссылки или img внутри .transport-services__gallery) */
export function extractGalleryImages(container: Element): CmsGalleryImage[] {
  const images: CmsGalleryImage[] = [];
  const seen = new Set<string>();

  container.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src')?.trim();
    if (!src || seen.has(src)) return;
    seen.add(src);
    images.push({
      src,
      alt: img.getAttribute('alt')?.trim() || '',
    });
  });

  return images;
}

export function parseCmsGalleryAttribute(raw: string | null): CmsGalleryImage[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CmsGalleryImage[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => typeof item?.src === 'string' && item.src.length > 0);
  } catch {
    return [];
  }
}
