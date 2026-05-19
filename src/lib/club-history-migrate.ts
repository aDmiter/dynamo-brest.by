import type { ClubHistoryBlock } from '@/config/club-history-data';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function blocksToContentHtml(blocks: ClubHistoryBlock[]): string {
  const parts: string[] = [];

  for (const block of blocks) {
    if (block.type === 'text') {
      const isHeading =
        block.text.startsWith('Все голы') ||
        block.text.startsWith('Состав') ||
        block.text.startsWith('Итоговая статистика');
      if (isHeading) {
        parts.push(`<p><strong>${escapeHtml(block.text)}</strong></p>`);
      } else {
        parts.push(`<p>${escapeHtml(block.text)}</p>`);
      }
    } else if (block.type === 'youtube') {
      const title = block.title ? escapeHtml(block.title) : 'Видео';
      parts.push(
        `<div class="club-history-embed"><iframe width="100%" height="450" src="https://www.youtube.com/embed/${block.videoId}" title="${title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`,
      );
    }
  }

  return parts.join('\n');
}

export function blocksToImages(
  blocks: ClubHistoryBlock[],
): { url: string; alt: string; sortOrder: number }[] {
  return blocks
    .filter((b): b is Extract<ClubHistoryBlock, { type: 'image' }> => b.type === 'image')
    .map((b, index) => ({
      url: b.src,
      alt: b.alt || '',
      sortOrder: index,
    }));
}

export function yearSortKeyFromLabel(label: string): number {
  const nums = label.match(/\d{4}/g);
  if (!nums) return 0;
  return Math.max(...nums.map(Number));
}
