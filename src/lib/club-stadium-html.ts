import {
  CLUB_STADIUM_CORE_LIST,
  CLUB_STADIUM_FACILITIES_LIST,
  CLUB_STADIUM_HEADING,
  CLUB_STADIUM_IMAGE,
  CLUB_STADIUM_PARAGRAPHS,
} from '@/config/club-stadium';
import { escapeHtml } from '@/lib/html';

function listHtml(items: string[]): string {
  return `<ul class="club-stadium-content__list">${items
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('')}</ul>`;
}

export function clubStadiumPageHtml(): string {
  const introParagraphs = CLUB_STADIUM_PARAGRAPHS.slice(0, 4)
    .map((text) => `<p class="club-stadium-content__p">${escapeHtml(text)}</p>`)
    .join('\n');

  const afterCoreParagraphs = CLUB_STADIUM_PARAGRAPHS.slice(4, 7)
    .map((text) => `<p class="club-stadium-content__p">${escapeHtml(text)}</p>`)
    .join('\n');

  const afterFacilitiesParagraphs = CLUB_STADIUM_PARAGRAPHS.slice(7)
    .map((text) => `<p class="club-stadium-content__p">${escapeHtml(text)}</p>`)
    .join('\n');

  return `<div class="club-stadium-content">
<figure class="club-stadium-content__photo">
<img src="${escapeHtml(CLUB_STADIUM_IMAGE)}" alt="${escapeHtml(CLUB_STADIUM_HEADING)}" loading="lazy" />
</figure>
<h2 class="club-stadium-content__title">${escapeHtml(CLUB_STADIUM_HEADING)}</h2>
${introParagraphs}
<h3 class="club-stadium-content__subtitle">Спортивное ядро включает в себя:</h3>
${listHtml(CLUB_STADIUM_CORE_LIST)}
${afterCoreParagraphs}
<h3 class="club-stadium-content__subtitle">Для проведения футбольных матчей и легкоатлетических соревнований на стадионе имеются все необходимые помещения:</h3>
${listHtml(CLUB_STADIUM_FACILITIES_LIST)}
${afterFacilitiesParagraphs}
</div>`;
}
