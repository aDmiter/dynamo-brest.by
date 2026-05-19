import type { ClubContactSection } from '@/config/club-contacts';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sectionToHtml(section: ClubContactSection): string {
  const phonesBlock =
    section.phones.length > 0
      ? `<div class="club-contacts-content__meta-block">
<h3 class="club-contacts-content__meta-label">Телефоны</h3>
<ul class="club-contacts-content__phones">
${section.phones
  .map(
    (p) =>
      `<li><span class="club-contacts-content__phone-label">${escapeHtml(p.label)}:</span> <a href="${escapeHtml(p.href)}" class="club-contacts-content__link">${escapeHtml(p.display)}</a></li>`,
  )
  .join('\n')}
</ul>
</div>`
      : '';

  const staffRows = section.staff
    .map(
      (s) =>
        `<tr>
<td>${escapeHtml(s.position)}</td>
<td>${escapeHtml(s.name)}</td>
<td><a href="${escapeHtml(s.phoneHref)}" class="club-contacts-content__link">${escapeHtml(s.phone)}</a></td>
</tr>`,
    )
    .join('\n');

  return `<section class="club-contacts-content__section" aria-labelledby="club-contacts-${escapeHtml(section.id)}-title">
<h2 id="club-contacts-${escapeHtml(section.id)}-title" class="club-contacts-content__section-title">${escapeHtml(section.title)}</h2>
<p class="club-contacts-content__legal">${escapeHtml(section.legalName)}</p>
<div class="club-contacts-content__meta">
<div class="club-contacts-content__meta-block">
<h3 class="club-contacts-content__meta-label">Юридический и почтовый адрес</h3>
<p class="club-contacts-content__meta-value">${escapeHtml(section.address)}</p>
</div>
${phonesBlock}
<div class="club-contacts-content__meta-block">
<h3 class="club-contacts-content__meta-label">E-mail</h3>
<p class="club-contacts-content__meta-value"><a href="mailto:${escapeHtml(section.email)}" class="club-contacts-content__link">${escapeHtml(section.email)}</a></p>
</div>
</div>
<div class="club-contacts-content__table-wrap">
<table class="club-contacts-content__table">
<thead>
<tr><th>Должность</th><th>Ф. И. О.</th><th>Номер телефона</th></tr>
</thead>
<tbody>
${staffRows}
</tbody>
</table>
</div>
</section>`;
}

export const CLUB_CONTACTS_CMS_LEAD =
  'Реквизиты, телефоны и сотрудники администрации ФК «Динамо-Брест» и СДЮШОР';

/** HTML для CMSTextPage «Контакты» с BEM-вёрсткой */
export function clubContactSectionsToHtml(
  sections: ClubContactSection[],
  lead: string = CLUB_CONTACTS_CMS_LEAD,
): string {
  const leadHtml = lead.trim()
    ? `<p class="club-contacts-content__lead">${escapeHtml(lead.trim())}</p>`
    : '';

  return `<div class="club-contacts-content">
${leadHtml}
${sections.map(sectionToHtml).join('\n')}
</div>`;
}
