'use client';

import { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { Input } from '@/components/ui/input';
import TipTapEditor from '@/modules/admin/components/TipTapEditor';

export type ContentBeFormState = {
  title: string;
  excerpt: string;
  content: string;
  subtitle: string;
  pageContent: string;
  name: string;
  description: string;
  composition: string;
};

const emptyState: ContentBeFormState = {
  title: '',
  excerpt: '',
  content: '',
  subtitle: '',
  pageContent: '',
  name: '',
  description: '',
  composition: '',
};

type FieldKey = keyof ContentBeFormState;

type Props = {
  value: Partial<ContentBeFormState>;
  onChange: (next: ContentBeFormState) => void;
  fields: FieldKey[];
};

export function emptyContentBeForm(): ContentBeFormState {
  return { ...emptyState };
}

export function contentBeFromRecord(record: Record<string, string>): ContentBeFormState {
  return {
    ...emptyState,
    title: record.title ?? '',
    excerpt: record.excerpt ?? '',
    content: record.content ?? '',
    subtitle: record.subtitle ?? '',
    pageContent: record.pageContent ?? '',
    name: record.name ?? '',
    description: record.description ?? '',
    composition: record.composition ?? '',
  };
}

export function contentBeToPayload(
  value: ContentBeFormState,
  fields: FieldKey[],
): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  for (const key of fields) {
    out[key] = value[key].trim() || null;
  }
  return out;
}

function hasFilledFields(state: ContentBeFormState, fields: FieldKey[]): boolean {
  return fields.some((key) => state[key].trim().length > 0);
}

export default function ContentBeFields({ value, onChange, fields }: Props) {
  const state = { ...emptyState, ...value };
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const autoOpenedRef = useRef(false);

  const set = (patch: Partial<ContentBeFormState>) => {
    onChange({ ...state, ...patch });
  };

  const filled = hasFilledFields(state, fields);

  useEffect(() => {
    if (autoOpenedRef.current || !filled || !detailsRef.current) return;
    detailsRef.current.open = true;
    autoOpenedRef.current = true;
  }, [filled]);

  return (
    <details
      ref={detailsRef}
      className="group rounded border border-dashed border-[#ee862c]/40 bg-[#ee862c]/5"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-sm font-bold text-[#ee862c]">Белорусская версия</span>
          <span className="text-xs font-normal text-gray-500">
            {filled
              ? 'Заполнено — на сайте при выборе BY'
              : 'Необязательно. Пустые поля на сайте показывают русский текст.'}
          </span>
        </span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className="h-3 w-3 shrink-0 text-[#ee862c] transition-transform group-open:rotate-180"
        />
      </summary>

      <div className="space-y-4 border-t border-[#ee862c]/20 px-4 pb-4 pt-4">
        {fields.includes('name') && (
          <div>
            <label className="mb-1 block text-xs text-gray-500">Название</label>
            <Input
              value={state.name}
              onChange={(e) => set({ name: e.target.value })}
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
        )}

        {fields.includes('title') && (
          <div>
            <label className="mb-1 block text-xs text-gray-500">Заголовок</label>
            <Input
              value={state.title}
              onChange={(e) => set({ title: e.target.value })}
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
        )}

        {fields.includes('subtitle') && (
          <div>
            <label className="mb-1 block text-xs text-gray-500">Подзаголовок</label>
            <Input
              value={state.subtitle}
              onChange={(e) => set({ subtitle: e.target.value })}
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
        )}

        {fields.includes('description') && (
          <div>
            <label className="mb-1 block text-xs text-gray-500">Описание</label>
            <textarea
              value={state.description}
              onChange={(e) => set({ description: e.target.value })}
              className="w-full border border-white/10 bg-white/5 p-3 text-sm text-white"
              rows={5}
            />
          </div>
        )}

        {fields.includes('composition') && (
          <div>
            <label className="mb-1 block text-xs text-gray-500">Состав</label>
            <textarea
              value={state.composition}
              onChange={(e) => set({ composition: e.target.value })}
              className="w-full border border-white/10 bg-white/5 p-3 text-sm text-white"
              rows={3}
            />
          </div>
        )}

        {fields.includes('excerpt') && (
          <div>
            <label className="mb-1 block text-xs text-gray-500">Краткое описание</label>
            <textarea
              value={state.excerpt}
              onChange={(e) => set({ excerpt: e.target.value })}
              className="w-full border border-white/10 bg-white/5 p-3 text-sm text-white"
              rows={2}
            />
          </div>
        )}

        {fields.includes('content') && (
          <div>
            <label className="mb-1 block text-xs text-gray-500">Текст</label>
            <TipTapEditor content={state.content} onChange={(html) => set({ content: html })} />
          </div>
        )}

        {fields.includes('pageContent') && (
          <div>
            <label className="mb-1 block text-xs text-gray-500">Содержимое страницы</label>
            <TipTapEditor
              content={state.pageContent}
              onChange={(html) => set({ pageContent: html })}
            />
          </div>
        )}
      </div>
    </details>
  );
}
