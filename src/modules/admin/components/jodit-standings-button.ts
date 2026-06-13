import { buildCmsStandingsHtml, CMS_STANDINGS_OPTIONS } from '@/lib/cms-standings';
import { JODIT_STANDINGS_ICON_URL } from '@/modules/admin/components/jodit-standings-icon';

type JoditWithPopup = {
  create: { fromHTML: (html: string) => HTMLElement };
  s: { insertHTML: (html: string) => void };
};

export function createJoditStandingsControl() {
  return {
    name: 'cmsStandings',
    tooltip: 'Вставить турнирную таблицу',
    iconURL: JODIT_STANDINGS_ICON_URL,
    popup: (
      editor: unknown,
      _current: unknown,
      _self: unknown,
      close: () => void
    ): HTMLElement => {
      const jed = editor as JoditWithPopup;
      const buttons = CMS_STANDINGS_OPTIONS.map(
        (option) =>
          `<button type="button" class="jodit-standings-option" data-comet-id="${option.cometId}" data-label="${option.label}" style="padding:12px 16px;border:1px solid rgba(255,255,255,0.12);background:#1a1f2e;color:#fff;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;text-align:left;">${option.label}</button>`
      ).join('');

      const wrap = jed.create.fromHTML(`
        <div class="jodit-standings-dialog" style="display:flex;flex-direction:column;gap:10px;padding:8px;min-width:280px;">
          <p style="margin:0;font-size:12px;color:#aaa;line-height:1.5;">Выберите состав — на сайте подставится актуальная таблица из COMET.</p>
          <div style="display:flex;flex-direction:column;gap:8px;">${buttons}</div>
        </div>
      `);

      wrap.querySelectorAll('.jodit-standings-option').forEach((btn) => {
        btn.addEventListener('click', () => {
          const cometId = btn.getAttribute('data-comet-id');
          if (!cometId) return;
          jed.s.insertHTML(buildCmsStandingsHtml(cometId));
          close();
        });
      });

      return wrap;
    },
  };
}
