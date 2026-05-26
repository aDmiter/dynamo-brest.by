/** Парсинг ссылки / embed-кода YouTube и HTML для CMS (без iframe — Jodit их ломает) */

import { escapeHtml } from '@/lib/html';

const YT_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;');
}

export function isYoutubeVideoId(id: string | null | undefined): id is string {
  return Boolean(id && YT_ID_RE.test(id));
}

export function extractYoutubeVideoId(raw: string): string | null {
  const input = raw.trim();
  if (!input) return null;

  const fromHtml =
    input.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/i)?.[1] ??
    input.match(/youtube\.com\/watch\?[^"'>\s]*\bv=([a-zA-Z0-9_-]{11})/i)?.[1] ??
    input.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i)?.[1] ??
    input.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i)?.[1];
  if (fromHtml && YT_ID_RE.test(fromHtml)) return fromHtml;

  try {
    const withProto = /^https?:\/\//i.test(input) ? input : `https://${input}`;
    const url = new URL(withProto);
    const host = url.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return id && YT_ID_RE.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const v = url.searchParams.get('v');
      if (v && YT_ID_RE.test(v)) return v;
      const embed = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
      if (embed) return embed[1];
      const shorts = url.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
      if (shorts) return shorts[1];
    }
  } catch {
    // не URL
  }

  return YT_ID_RE.test(input) ? input : null;
}

/** ID из блока в HTML (data-атрибут, iframe или битая разметка Jodit) */
export function resolveCmsYoutubeVideoId(el: Element): string | null {
  const fromAttr = el.getAttribute('data-cms-youtube');
  if (isYoutubeVideoId(fromAttr)) return fromAttr;

  const iframe = el.querySelector('iframe[src*="youtube"]');
  if (iframe) {
    return extractYoutubeVideoId(iframe.getAttribute('src') || '');
  }

  const html = el.innerHTML;
  if (html) {
    return extractYoutubeVideoId(html);
  }

  return null;
}

/** Разметка для Jodit и БД: превью + data-cms-youtube (iframe на сайте через CmsHtmlContent) */
export function buildYoutubeEmbedHtml(raw: string): string {
  const videoId = extractYoutubeVideoId(raw);
  if (!videoId) return '';

  const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return `<div class="cms-youtube-embed" data-cms-youtube="${escapeAttr(videoId)}" contenteditable="false"><div class="cms-youtube-embed__preview"><img src="${escapeHtml(thumb)}" alt="YouTube" loading="lazy" width="480" height="270" /><span class="cms-youtube-embed__badge">YouTube</span></div></div>`;
}

export function buildYoutubeIframeHtml(videoId: string): string {
  if (!isYoutubeVideoId(videoId)) return '';
  return `<div class="cms-youtube-embed__frame"><iframe src="https://www.youtube.com/embed/${videoId}" title="Видео YouTube" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe></div>`;
}
