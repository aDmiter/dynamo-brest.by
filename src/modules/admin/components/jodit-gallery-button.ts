import type { CmsGalleryImage } from '@/lib/cms-gallery';
import { escapeHtml } from '@/lib/html';
import { uploadImageToServer } from '@/lib/jodit-uploader';
import { JODIT_GALLERY_ICON_URL } from '@/modules/admin/components/jodit-gallery-icon';

type JoditEditorLike = {
  selection: { insertHTML: (html: string) => void };
  dlg: (options?: { title?: string }) => {
    open: () => void;
    close: () => void;
    container: HTMLElement;
    setContent: (content: string) => void;
  };
};

async function uploadGalleryImage(file: File): Promise<string | null> {
  const data = await uploadImageToServer(file, 'cms-galleries');
  return data.url ?? null;
}

function renderGalleryList(container: HTMLElement, images: CmsGalleryImage[]) {
  const list = container.querySelector('#jodit-gallery-list') as HTMLDivElement | null;
  if (!list) return;

  if (images.length === 0) {
    list.innerHTML = '<p style="margin:0;font-size:12px;color:#888;">Фото не добавлены</p>';
    return;
  }

  list.innerHTML = images
    .map(
      (img, index) => `
    <div class="jodit-gallery-item" data-index="${index}" style="display:flex;align-items:center;gap:10px;padding:8px;border:1px solid rgba(255,255,255,0.1);border-radius:6px;background:rgba(0,0,0,0.2);">
      <img src="${escapeHtml(img.src)}" alt="" style="width:72px;height:54px;object-fit:cover;border-radius:4px;flex-shrink:0;" />
      <input type="text" class="jodit-gallery-alt" value="${escapeHtml(img.alt)}" placeholder="Подпись" style="flex:1;padding:6px 8px;border:1px solid rgba(255,255,255,0.15);background:#1a1a2e;color:#fff;border-radius:4px;font-size:12px;" />
      <button type="button" class="jodit-gallery-remove" data-index="${index}" style="padding:6px 10px;border:1px solid rgba(239,68,68,0.4);background:rgba(239,68,68,0.15);color:#fca5a5;border-radius:4px;font-size:11px;cursor:pointer;">×</button>
    </div>`,
    )
    .join('');

  list.querySelectorAll('.jodit-gallery-remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number((btn as HTMLButtonElement).dataset.index);
      images.splice(idx, 1);
      renderGalleryList(container, images);
    });
  });
}

function collectGalleryImages(container: HTMLElement): CmsGalleryImage[] {
  const items = container.querySelectorAll('.jodit-gallery-item');
  const result: CmsGalleryImage[] = [];

  items.forEach((item, index) => {
    const img = item.querySelector('img') as HTMLImageElement | null;
    const altInput = item.querySelector('.jodit-gallery-alt') as HTMLInputElement | null;
    if (!img?.src) return;
    result.push({
      src: img.src,
      alt: altInput?.value.trim() || `Фото ${index + 1}`,
    });
  });

  return result;
}

export function createJoditGalleryButton(buildHtml: (images: CmsGalleryImage[]) => string) {
  return {
    name: 'cmsGallery',
    tooltip: 'Вставить галерею',
    iconURL: JODIT_GALLERY_ICON_URL,
    exec: (editor: unknown) => {
      const jed = editor as JoditEditorLike;
      const images: CmsGalleryImage[] = [];

      const dialog = jed.dlg({ title: 'Галерея фотографий' });
      dialog.setContent(`
    <div class="jodit-gallery-dialog" style="display:flex;flex-direction:column;gap:12px;padding:12px;min-width:520px;max-width:640px;">
      <p style="margin:0;font-size:12px;color:#aaa;line-height:1.5;">Загрузите несколько фото. На сайте галерея откроется с просмотром в полноэкранном режиме.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <input type="file" id="jodit-gallery-files" accept="image/*" multiple style="display:none;" />
        <button type="button" id="jodit-gallery-upload" style="padding:10px 16px;background:var(--color-accent,#ee862c);color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">Добавить фото</button>
      </div>
      <div id="jodit-gallery-list" style="display:flex;flex-direction:column;gap:8px;max-height:320px;overflow-y:auto;"></div>
      <button type="button" id="jodit-gallery-insert" style="margin-top:4px;padding:10px 20px;background:#22c55e;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;text-transform:uppercase;letter-spacing:0.05em;">Вставить галерею</button>
    </div>
  `);
      dialog.open();

      setTimeout(() => {
        const { container } = dialog;
        renderGalleryList(container, images);

        const fileInput = container.querySelector('#jodit-gallery-files') as HTMLInputElement;
        const uploadBtn = container.querySelector('#jodit-gallery-upload') as HTMLButtonElement;

        uploadBtn?.addEventListener('click', () => fileInput?.click());

        fileInput?.addEventListener('change', async () => {
          const files = fileInput.files;
          if (!files?.length) return;

          uploadBtn.disabled = true;
          uploadBtn.textContent = 'Загрузка…';

          for (const file of Array.from(files)) {
            const url = await uploadGalleryImage(file);
            if (url) {
              images.push({ src: url, alt: `Фото ${images.length + 1}` });
            }
          }

          fileInput.value = '';
          uploadBtn.disabled = false;
          uploadBtn.textContent = 'Добавить фото';
          renderGalleryList(container, images);
        });

        container.querySelector('#jodit-gallery-insert')?.addEventListener('click', () => {
          const finalImages = collectGalleryImages(container);
          if (finalImages.length === 0) return;
          jed.selection.insertHTML(buildHtml(finalImages));
          dialog.close();
        });
      }, 100);
    },
  };
}
