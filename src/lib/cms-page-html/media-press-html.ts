import { escapeHtml } from '@/lib/html';
import { dividerHtml, sectionHtml, wrapCmsPageContent } from '@/lib/cms-page-html/helpers';

const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://facebook.com/dynamobrest' },
  { label: 'VK', href: 'https://vk.com/dynamobrest' },
  { label: 'X', href: 'https://x.com/dynamobrest' },
  { label: 'Instagram', href: 'https://instagram.com/dynamobrest' },
  { label: 'OK', href: 'https://ok.ru/dynamobrest' },
  { label: 'Telegram', href: 'https://t.me/dynamobrest' },
  { label: 'YouTube', href: 'https://youtube.com/dynamobrest?sub_confirmation=1' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@dynamobrest' },
];

const LOGO_DOWNLOADS = [
  {
    label: 'руководству',
    href: '/images/smi/FCDB_Brandbook.pdf',
    note: '343 Kb',
  },
  { label: 'PNG', href: '/images/smi/FC_Logo.rar', note: '108 Kb' },
  { label: 'Ai', href: '/images/smi/FC_Logo.ai', note: '1.66 Mb' },
  { label: 'Cdr', href: '/images/smi/FC_Logo.cdr', note: '53 Kb' },
  { label: 'Eps', href: '/images/smi/FC_Logo.eps', note: '1.77 Mb' },
];

function socialLinksHtml(): string {
  const items = SOCIAL_LINKS.map(
    (s) =>
      `<li><a href="${escapeHtml(s.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.label)}</a></li>`,
  ).join('');
  return `<ul class="transport-services__list">${items}</ul>`;
}

function logoDownloadsHtml(): string {
  const items = LOGO_DOWNLOADS.slice(1).map(
    (f) =>
      `<li>Логотип в формате <a href="${escapeHtml(f.href)}" download>${escapeHtml(f.label)}</a> (${escapeHtml(f.note)})</li>`,
  ).join('');
  return `<ul class="transport-services__list">${items}</ul>`;
}

export function mediaPressPageHtml(): string {
  const brief = `<p class="transport-services__lead">Учреждение физической культуры и спорта «Государственный футбольный клуб «Динамо-Брест»» — белорусский футбольный клуб из города Бреста, участник всех суверенных чемпионатов Беларуси. Основан в 1960 году.</p>
<p class="transport-services__vehicle-desc">Трёхкратный обладатель Кубка Беларуси (2007, 2017, 2018), трёхкратный обладатель Суперкубка (2018, 2019, 2020), чемпион Беларуси (2019), бронзовый призёр чемпионата Беларуси (1992).</p>`;

  const social = sectionHtml('media-social', 'Социальные сети', socialLinksHtml());

  const contacts = sectionHtml(
    'media-contacts',
    'Контакты',
    `<p class="transport-services__vehicle-desc"><strong>Пресс-секретарь ФК «Динамо-Брест»:</strong> Евгений Романюк</p>
<p class="transport-services__phone">Контактный телефон: <a href="tel:+375333224551">+375 33 322 45 51</a></p>
<p class="transport-services__vehicle-desc">E-mail: <a href="mailto:press@dynamo-brest.by">press@dynamo-brest.by</a></p>`,
  );

  const logos = sectionHtml(
    'media-logos',
    'Логотипы',
    `<p class="transport-services__vehicle-desc">Логотип является собственностью ФК «Динамо-Брест» и охраняется авторским правом.</p>
<p class="transport-services__vehicle-desc">Логотип должен использоваться строго в соответствии с <a href="${escapeHtml(LOGO_DOWNLOADS[0].href)}" download>руководством</a> (${escapeHtml(LOGO_DOWNLOADS[0].note)}).</p>
${logoDownloadsHtml()}`,
  );

  return wrapCmsPageContent(`${brief}${dividerHtml()}${social}${dividerHtml()}${contacts}${dividerHtml()}${logos}`);
}
