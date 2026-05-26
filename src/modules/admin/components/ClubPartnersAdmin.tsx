'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical, faPlus, faSave, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ImageUpload from '@/modules/admin/components/ImageUpload';
import DeleteButton from '@/modules/admin/components/DeleteButton';
import ToggleButton from '@/modules/admin/components/ToggleButton';
import TipTapEditor from '@/modules/admin/components/TipTapEditor';
import {
  CLUB_PARTNER_SECTIONS,
  DEFAULT_CLUB_PARTNERS_CTA_HTML,
  type ClubPartnerSectionId,
  type ClubPartnersPageData,
} from '@/lib/club-partners';

type LogoRow = {
  id: string;
  src: string;
  alt: string;
  href: string | null;
  sortOrder: number;
  isActive: boolean;
};

const emptyAddForm = { src: '', alt: '', href: '' };

export default function ClubPartnersAdmin() {
  const [data, setData] = useState<ClubPartnersPageData | null>(null);
  const [ctaHtml, setCtaHtml] = useState(DEFAULT_CLUB_PARTNERS_CTA_HTML);
  const [loading, setLoading] = useState(true);
  const [savingCta, setSavingCta] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [addForms, setAddForms] = useState<Record<ClubPartnerSectionId, typeof emptyAddForm>>({
    title: { ...emptyAddForm },
    general: { ...emptyAddForm },
    partners: { ...emptyAddForm },
  });
  const [adding, setAdding] = useState<ClubPartnerSectionId | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/club-partners');
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const json = (await res.json()) as ClubPartnersPageData;
    setData(json);
    setCtaHtml(json.ctaHtml || DEFAULT_CLUB_PARTNERS_CTA_HTML);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const setSectionLogos = (section: ClubPartnerSectionId, logos: LogoRow[]) => {
    setData((prev) => (prev ? { ...prev, [section]: logos } : prev));
  };

  const saveCta = async () => {
    setSavingCta(true);
    await fetch('/api/admin/club-partners/cta', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ctaHtml }),
    });
    setSavingCta(false);
  };

  const onDragEnd = (section: ClubPartnerSectionId) => async (result: DropResult) => {
    if (!data || !result.destination || result.source.index === result.destination.index) return;
    if (result.source.droppableId !== result.destination.droppableId) return;

    const list = [...(data[section] as LogoRow[])];
    const [moved] = list.splice(result.source.index, 1);
    list.splice(result.destination.index, 0, moved);
    const reordered = list.map((item, index) => ({ ...item, sortOrder: index }));
    const previous = data;
    setData({ ...data, [section]: reordered });
    setSavingOrder(true);
    setOrderError(null);

    try {
      const res = await fetch('/api/admin/club-partners/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          items: reordered.map((item, index) => ({ id: item.id, sortOrder: index })),
        }),
      });
      if (!res.ok) {
        setData(previous);
        setOrderError('Не удалось сохранить порядок');
      }
    } catch {
      setData(previous);
      setOrderError('Ошибка соединения при сохранении порядка');
    } finally {
      setSavingOrder(false);
    }
  };

  const addLogo = async (section: ClubPartnerSectionId) => {
    const form = addForms[section];
    if (!form.src.trim()) {
      alert('Загрузите логотип');
      return;
    }
    setAdding(section);
    try {
      const res = await fetch('/api/admin/club-partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          src: form.src,
          alt: form.alt.trim() || 'Партнёр',
          href: form.href.trim() || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert((err as { error?: string }).error || 'Ошибка добавления');
        return;
      }
      setAddForms((prev) => ({ ...prev, [section]: { ...emptyAddForm } }));
      await load();
    } finally {
      setAdding(null);
    }
  };

  const updateLogo = async (id: string, patch: { alt?: string; href?: string | null }) => {
    await fetch(`/api/admin/club-partners/logos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
  };

  if (loading || !data) {
    return <p className="text-gray-500">Загрузка…</p>;
  }

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-gray-400">
          Изменения сразу попадают на{' '}
          <Link href="/club/partners" target="_blank" className="text-[#ee862c] hover:underline">
            /club/partners
            <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-1 text-[10px]" />
          </Link>
        </p>
        {(savingOrder || orderError) && (
          <p className={`text-sm ${orderError ? 'text-red-400' : 'text-gray-500'}`}>
            {orderError || 'Сохранение порядка…'}
          </p>
        )}
      </div>

      {CLUB_PARTNER_SECTIONS.map(({ id: section, label }) => {
        const logos = data[section] as LogoRow[];
        const form = addForms[section];

        return (
          <section
            key={section}
            className="border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
          >
            <h2 className="mb-4 text-lg font-bold text-white">{label}</h2>

            <div className="mb-6 space-y-3 rounded border border-dashed border-white/15 bg-black/20 p-4">
              <p className="text-xs text-gray-500">Новый логотип</p>
              <ImageUpload
                value={form.src}
                onChange={(url) =>
                  setAddForms((prev) => ({ ...prev, [section]: { ...prev[section], src: url } }))
                }
                folder="partners/sponsors"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Подпись (alt)</label>
                  <Input
                    value={form.alt}
                    onChange={(e) =>
                      setAddForms((prev) => ({
                        ...prev,
                        [section]: { ...prev[section], alt: e.target.value },
                      }))
                    }
                    className="border-white/10 bg-white/5 text-white"
                    placeholder="Название компании"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Ссылка (необязательно)</label>
                  <Input
                    value={form.href}
                    onChange={(e) =>
                      setAddForms((prev) => ({
                        ...prev,
                        [section]: { ...prev[section], href: e.target.value },
                      }))
                    }
                    className="border-white/10 bg-white/5 text-white"
                    placeholder="https://"
                  />
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                disabled={adding === section}
                className="bg-[#ee862c] hover:bg-[#f0ac74]"
                onClick={() => addLogo(section)}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                {adding === section ? 'Добавление…' : 'Добавить логотип'}
              </Button>
            </div>

            {logos.length === 0 ? (
              <p className="text-sm text-gray-500">Логотипов пока нет</p>
            ) : (
              <DragDropContext onDragEnd={onDragEnd(section)}>
                <Droppable droppableId={section}>
                  {(provided) => (
                    <ul
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-2"
                    >
                      {logos.map((logo, index) => (
                        <Draggable key={logo.id} draggableId={logo.id} index={index}>
                          {(dragProvided) => (
                            <li
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              className={`flex flex-wrap items-center gap-3 border border-white/10 bg-[#1a1f2e] p-3 ${
                                logo.isActive ? '' : 'opacity-50'
                              }`}
                            >
                              <span
                                {...dragProvided.dragHandleProps}
                                className="cursor-grab text-gray-500 hover:text-white"
                                title="Перетащить"
                              >
                                <FontAwesomeIcon icon={faGripVertical} />
                              </span>
                              <img
                                src={logo.src}
                                alt=""
                                className="h-12 w-24 object-contain bg-white rounded px-2"
                              />
                              <Input
                                defaultValue={logo.alt}
                                onBlur={(e) => {
                                  const alt = e.target.value.trim();
                                  if (alt && alt !== logo.alt) {
                                    updateLogo(logo.id, { alt });
                                    setSectionLogos(
                                      section,
                                      logos.map((l) =>
                                        l.id === logo.id ? { ...l, alt } : l,
                                      ),
                                    );
                                  }
                                }}
                                className="min-w-[140px] flex-1 border-white/10 bg-white/5 text-sm text-white"
                                placeholder="Подпись"
                              />
                              <Input
                                defaultValue={logo.href ?? ''}
                                onBlur={(e) => {
                                  const href = e.target.value.trim() || null;
                                  if (href !== (logo.href ?? null)) {
                                    updateLogo(logo.id, { href });
                                    setSectionLogos(
                                      section,
                                      logos.map((l) =>
                                        l.id === logo.id ? { ...l, href } : l,
                                      ),
                                    );
                                  }
                                }}
                                className="min-w-[180px] flex-1 border-white/10 bg-white/5 text-sm text-white"
                                placeholder="Ссылка"
                              />
                              <ToggleButton
                                id={logo.id}
                                apiUrl="/api/admin/club-partners/logos"
                                field="isActive"
                                value={logo.isActive}
                                labelOn="Вкл"
                                labelOff="Выкл"
                                onChanged={(newValue) => {
                                  setSectionLogos(
                                    section,
                                    logos.map((l) =>
                                      l.id === logo.id ? { ...l, isActive: newValue } : l,
                                    ),
                                  );
                                  void load();
                                }}
                              />
                              <DeleteButton
                                id={logo.id}
                                apiUrl="/api/admin/club-partners/logos"
                                name={logo.alt}
                                onDeleted={load}
                              />
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Перетащите строки для изменения порядка на сайте
            </p>
          </section>
        );
      })}

      <section className="border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-white">Стать партнером</h2>
          <Button
            type="button"
            size="sm"
            disabled={savingCta}
            className="bg-[#ee862c] hover:bg-[#f0ac74]"
            onClick={saveCta}
          >
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            {savingCta ? 'Сохранение…' : 'Сохранить блок'}
          </Button>
        </div>
        <p className="mb-3 text-xs text-gray-500">
          Заголовок «Стать партнером» на сайте фиксированный. Ниже — текст и контакты (редактор).
        </p>
        <TipTapEditor content={ctaHtml} onChange={setCtaHtml} />
      </section>
    </div>
  );
}
