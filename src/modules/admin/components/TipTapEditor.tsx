// src/modules/admin/components/TipTapEditor.tsx - Визуальный редактор на TipTap
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBold,
  faItalic,
  faUnderline,
  faStrikethrough,
  faListUl,
  faListOl,
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify,
  faLink,
  faImage,
  faUndo,
  faRedo,
  faHeading,
  faQuoteRight,
  faCode,
  faMinus,
} from '@fortawesome/free-solid-svg-icons';
import { useCallback } from 'react';

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
}

export default function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ allowBase64: true }),
      Link.configure({ openOnClick: false }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] p-4 text-white',
      },
    },
  });

  const addImage = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url) {
          editor.chain().focus().setImage({ src: data.url }).run();
        }
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      }
    };
    input.click();
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    const url = window.prompt('URL:', previousUrl);

    if (url === null) return; // Отмена

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-white/10 bg-white/5">
      {/* Тулбар */}
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 p-2">
        {/* Форматирование текста */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 text-sm transition-colors ${editor.isActive('bold') ? 'bg-[#ee862c]/30 text-[#ee862c]' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          title="Жирный (Ctrl+B)"
        >
          <FontAwesomeIcon icon={faBold} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 text-sm transition-colors ${editor.isActive('italic') ? 'bg-[#ee862c]/30 text-[#ee862c]' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          title="Курсив (Ctrl+I)"
        >
          <FontAwesomeIcon icon={faItalic} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 text-sm transition-colors ${editor.isActive('underline') ? 'bg-[#ee862c]/30 text-[#ee862c]' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          title="Подчёркнутый (Ctrl+U)"
        >
          <FontAwesomeIcon icon={faUnderline} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 text-sm transition-colors ${editor.isActive('strike') ? 'bg-[#ee862c]/30 text-[#ee862c]' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          title="Зачёркнутый"
        >
          <FontAwesomeIcon icon={faStrikethrough} />
        </button>

        <span className="mx-1 h-5 w-[1px] bg-white/20" />

        {/* Заголовки */}
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 text-xs font-bold transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-[#ee862c]/30 text-[#ee862c]' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          title="Заголовок 1"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 text-xs font-bold transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-[#ee862c]/30 text-[#ee862c]' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          title="Заголовок 2"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 text-xs font-bold transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-[#ee862c]/30 text-[#ee862c]' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          title="Заголовок 3"
        >
          H3
        </button>

        <span className="mx-1 h-5 w-[1px] bg-white/20" />

        {/* Выравнивание */}
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`px-2 py-1 text-sm transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-[#ee862c]/30 text-[#ee862c]' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          title="По левому краю"
        >
          <FontAwesomeIcon icon={faAlignLeft} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`px-2 py-1 text-sm transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-[#ee862c]/30 text-[#ee862c]' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          title="По центру"
        >
          <FontAwesomeIcon icon={faAlignCenter} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`px-2 py-1 text-sm transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-[#ee862c]/30 text-[#ee862c]' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          title="По правому краю"
        >
          <FontAwesomeIcon icon={faAlignRight} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`px-2 py-1 text-sm transition-colors ${editor.isActive({ textAlign: 'justify' }) ? 'bg-[#ee862c]/30 text-[#ee862c]' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          title="По ширине"
        >
          <FontAwesomeIcon icon={faAlignJustify} />
        </button>

        <span className="mx-1 h-5 w-[1px] bg-white/20" />

        {/* Списки */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 text-sm transition-colors ${editor.isActive('bulletList') ? 'bg-[#ee862c]/30 text-[#ee862c]' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          title="Маркированный список"
        >
          <FontAwesomeIcon icon={faListUl} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 text-sm transition-colors ${editor.isActive('orderedList') ? 'bg-[#ee862c]/30 text-[#ee862c]' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          title="Нумерованный список"
        >
          <FontAwesomeIcon icon={faListOl} />
        </button>

        <span className="mx-1 h-5 w-[1px] bg-white/20" />

        {/* Вставки */}
        <button
          onClick={setLink}
          className={`px-2 py-1 text-sm transition-colors ${editor.isActive('link') ? 'bg-[#ee862c]/30 text-[#ee862c]' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          title="Ссылка"
        >
          <FontAwesomeIcon icon={faLink} />
        </button>
        <button
          onClick={addImage}
          className="px-2 py-1 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Изображение"
        >
          <FontAwesomeIcon icon={faImage} />
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-2 py-1 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Горизонтальная линия"
        >
          <FontAwesomeIcon icon={faMinus} />
        </button>

        <span className="mx-1 h-5 w-[1px] bg-white/20" />

        {/* Цитата и код */}
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 text-sm transition-colors ${editor.isActive('blockquote') ? 'bg-[#ee862c]/30 text-[#ee862c]' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          title="Цитата"
        >
          <FontAwesomeIcon icon={faQuoteRight} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`px-2 py-1 text-sm transition-colors ${editor.isActive('codeBlock') ? 'bg-[#ee862c]/30 text-[#ee862c]' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
          title="Блок кода"
        >
          <FontAwesomeIcon icon={faCode} />
        </button>

        <span className="mx-1 h-5 w-[1px] bg-white/20" />

        {/* Undo/Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="px-2 py-1 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"
          title="Отменить"
        >
          <FontAwesomeIcon icon={faUndo} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="px-2 py-1 text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"
          title="Вернуть"
        >
          <FontAwesomeIcon icon={faRedo} />
        </button>
      </div>

      {/* Контент редактора */}
      <EditorContent editor={editor} />
    </div>
  );
}
