// src/modules/admin/components/TipTapEditor.tsx - HTML-редактор на Jodit
'use client';

import { useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';

interface JoditEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

export default function TipTapEditor({ content, onChange }: JoditEditorProps) {
  const editor = useRef(null);

  const config = useMemo(
    () => ({
      readonly: false,
      height: 500,
      theme: 'dark',
      language: 'ru',
      toolbar: true,
      buttons: [
        'source',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        'ul',
        'ol',
        '|',
        'outdent',
        'indent',
        '|',
        'font',
        'fontsize',
        'brush',
        'paragraph',
        '|',
        'image',
        'link',
        'table',
        '|',
        'align',
        'undo',
        'redo',
        '|',
        'hr',
        'eraser',
        'fullsize',
        'selectall',
        'copyformat',
        '|',
        'spoiler',
      ],
      extraButtons: [
        {
          name: 'spoiler',
          tooltip: 'Вставить спойлер',
          text: '📋',
          icon: 'layers',
          exec: async (editor: unknown) => {
            const JoditStatic = (await import('jodit')).Jodit;
            const jed = editor as {
              selection: { insertHTML: (html: string) => void };
              dlg: (options?: { title?: string; content?: string; buttons?: string[] }) => {
                open: () => void;
                close: () => void;
                container: HTMLElement;
                setContent: (content: string) => void;
              };
            };

            const dialog = jed.dlg({ title: 'Вставить спойлер' });
            dialog.setContent(`
    <div class="spoiler-dialog" style="display:flex;flex-direction:column;gap:10px;padding:12px;min-width:480px;">
      <label style="font-size:11px;color:#aaa;">Заголовок спойлера</label>
      <input type="text" id="jodit-spoiler-title" placeholder="Нажмите, чтобы раскрыть" style="width:100%;padding:8px;border:1px solid var(--color-border);background:var(--color-bg-admin);color:#fff;border-radius:6px;font-size:13px;box-sizing:border-box;" />
      <label style="font-size:11px;color:#aaa;">Содержимое</label>
      <div id="jodit-spoiler-editor-container" style="height:300px;border:1px solid var(--color-border);border-radius:6px;overflow:hidden;"></div>
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:#aaa;cursor:pointer;">
        <input type="checkbox" id="jodit-spoiler-open" style="accent-color:var(--color-accent);" /> Открыт по умолчанию
      </label>
      <button id="jodit-spoiler-insert" style="margin-top:8px;padding:10px 20px;background:var(--color-accent);color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;text-transform:uppercase;letter-spacing:0.05em;">Вставить спойлер</button>
    </div>
  `);
            dialog.open();

            setTimeout(() => {
              const container = dialog.container;
              const editorDiv = container.querySelector(
                '#jodit-spoiler-editor-container'
              ) as HTMLDivElement;
              if (!editorDiv) return;

              const innerEditor = JoditStatic.make(editorDiv, {
                height: 300,
                theme: 'dark',
                language: 'ru',
                toolbar: true,
                buttons: [
                  'source',
                  '|',
                  'bold',
                  'italic',
                  'underline',
                  'strikethrough',
                  '|',
                  'ul',
                  'ol',
                  '|',
                  'font',
                  'fontsize',
                  'brush',
                  'paragraph',
                  '|',
                  'image',
                  'link',
                  'table',
                  '|',
                  'align',
                  'undo',
                  'redo',
                  '|',
                  'hr',
                  'fullsize',
                ],
                uploader: {
                  url: '/api/upload',
                  format: 'json',
                  filesVariableName: 'file',
                  isSuccess: (resp: { url?: string }) => !!resp.url,
                  process: (resp: { url?: string }) => resp.url || '',
                },
                style: {
                  background: 'var(--color-bg-admin, #1a1a2e)',
                  color: '#ffffff',
                },
              });

              container.querySelector('#jodit-spoiler-insert')?.addEventListener('click', () => {
                const title =
                  (
                    container.querySelector('#jodit-spoiler-title') as HTMLInputElement
                  ).value.trim() || 'Нажмите, чтобы раскрыть';
                const text = innerEditor.value || '<p>Содержимое спойлера здесь...</p>';
                const open = (container.querySelector('#jodit-spoiler-open') as HTMLInputElement)
                  .checked;

                const spoilerHtml = `<details${open ? ' open' : ''} style="margin: 16px 0; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; background: var(--color-bg-card);">
  <summary style="padding: 12px 16px; font-family: 'Inter Tight', sans-serif; font-weight: 700; font-size: 15px; color: var(--color-accent); cursor: pointer; user-select: none; letter-spacing: 0.04em; text-transform: uppercase;">${title}</summary>
  <div style="padding: 16px; color: #ffffff; font-size: 14px; line-height: 1.6; border-top: 1px solid var(--color-border);">${text}</div>
</details>`;

                innerEditor.destruct();
                jed.selection.insertHTML(spoilerHtml);
                dialog.close();
              });
            }, 200);
          },
        },
      ],
      uploader: {
        url: '/api/upload',
        format: 'json',
        filesVariableName: 'file',
        isSuccess: (resp: { url?: string; error?: string }) => !!resp.url,
        process: (resp: { url?: string }) => resp.url || '',
      },
      style: {
        background: 'var(--color-bg-admin, #1a1a2e)',
        color: '#ffffff',
      },
    }),
    []
  );

  return (
    <div
      className="jodit-wrapper"
      style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}
    >
      <JoditEditor
        ref={editor}
        value={content}
        config={config}
        onBlur={(newContent: string) => onChange(newContent)}
        onChange={(newContent: string) => onChange(newContent)}
      />
    </div>
  );
}
