import { buildYoutubeEmbedHtml, extractYoutubeVideoId } from '@/lib/youtube-embed';
import { JODIT_YOUTUBE_ICON_URL } from '@/modules/admin/components/jodit-youtube-icon';

type JoditWithPopup = {
  create: { fromHTML: (html: string) => HTMLElement };
  s: { insertHTML: (html: string) => void };
  e: { on: (el: HTMLElement, event: string, handler: (e: Event) => void) => void };
};

const DIALOG_HTML = `
  <div class="jodit-youtube-dialog" style="display:flex;flex-direction:column;gap:12px;padding:4px;min-width:420px;max-width:520px;">
    <p style="margin:0;font-size:12px;color:#aaa;line-height:1.5;">Ссылка на ролик или код встраивания (iframe).</p>
    <textarea id="jodit-youtube-input" rows="4" placeholder="https://www.youtube.com/watch?v=…" style="width:100%;padding:8px;border:1px solid rgba(255,255,255,0.15);background:#1a1f2e;color:#fff;border-radius:6px;font-size:13px;resize:vertical;box-sizing:border-box;font-family:inherit;"></textarea>
    <p id="jodit-youtube-error" style="margin:0;font-size:12px;color:#fca5a5;display:none;"></p>
    <div style="display:flex;gap:8px;justify-content:flex-end;">
      <button type="button" id="jodit-youtube-cancel" style="padding:8px 14px;border:1px solid rgba(255,255,255,0.2);background:transparent;color:#ccc;border-radius:6px;font-size:12px;cursor:pointer;">Отмена</button>
      <button type="button" id="jodit-youtube-insert" style="padding:8px 18px;background:var(--color-accent,#3b93f1);color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">OK</button>
    </div>
  </div>
`;

export function createJoditYoutubeControl() {
  return {
    name: 'cmsYoutube',
    tooltip: 'Вставить видео YouTube',
    iconURL: JODIT_YOUTUBE_ICON_URL,
    popup: (
      editor: unknown,
      _current: unknown,
      _self: unknown,
      close: () => void
    ): HTMLElement => {
      const jed = editor as JoditWithPopup;
      const wrap = jed.create.fromHTML(DIALOG_HTML);
      const input = wrap.querySelector('#jodit-youtube-input') as HTMLTextAreaElement;
      const errorEl = wrap.querySelector('#jodit-youtube-error') as HTMLParagraphElement;

      const showError = (msg: string) => {
        if (errorEl) {
          errorEl.textContent = msg;
          errorEl.style.display = msg ? 'block' : 'none';
        }
      };

      wrap.querySelector('#jodit-youtube-cancel')?.addEventListener('click', () => close());

      wrap.querySelector('#jodit-youtube-insert')?.addEventListener('click', () => {
        const raw = input?.value.trim() ?? '';
        if (!raw) {
          showError('Укажите ссылку или код встраивания.');
          return;
        }
        if (!extractYoutubeVideoId(raw)) {
          showError('Не удалось распознать видео YouTube.');
          return;
        }
        const html = buildYoutubeEmbedHtml(raw);
        if (!html) {
          showError('Не удалось сформировать встраивание.');
          return;
        }
        jed.s.insertHTML(html);
        close();
      });

      setTimeout(() => input?.focus(), 50);
      return wrap;
    },
  };
}
