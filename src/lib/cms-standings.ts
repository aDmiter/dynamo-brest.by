import { COMET_STANDINGS_IDS } from '@/lib/standings';

export const CMS_STANDINGS_OPTIONS = [
  { cometId: COMET_STANDINGS_IDS.osnova, label: 'Основа' },
  { cometId: COMET_STANDINGS_IDS.dubl, label: 'Дубль' },
  { cometId: COMET_STANDINGS_IDS.women, label: 'Женщины' },
] as const;

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;');
}

export function buildCmsStandingsHtml(cometId: string): string {
  return `<div class="cms-standings-embed" data-cms-standings="${escapeAttr(cometId)}" contenteditable="false"><span class="cms-standings-embed__placeholder">Турнирная таблица</span></div>`;
}

export function parseCmsStandingsEmbed(el: Element): string | null {
  return el.getAttribute('data-cms-standings')?.trim() || null;
}
