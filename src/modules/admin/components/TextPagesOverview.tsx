'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faFileAlt, faImage } from '@fortawesome/free-solid-svg-icons';

export interface TextPageOverviewItem {
  id: string;
  title: string;
  url: string;
  group?: string;
  subtitle: string | null;
  heroHeader: boolean;
  isActive: boolean;
}

interface TextPagesOverviewProps {
  pages: TextPageOverviewItem[];
  onEdit: (id: string) => void;
}

export default function TextPagesOverview({ pages, onEdit }: TextPagesOverviewProps) {
  if (pages.length === 0) {
    return (
      <div className="mb-8 border border-white/10 bg-white/5 p-6">
        <h2 className="mb-2 font-heading text-lg font-bold text-white">Текстовые страницы</h2>
        <p className="text-sm text-gray-500">Пока нет пунктов с типом «Текстовая страница»</p>
      </div>
    );
  }

  return (
    <div className="mb-8 border border-white/10 bg-white/5 p-6">
      <h2 className="mb-1 font-heading text-lg font-bold text-white">Текстовые страницы</h2>
      <p className="mb-4 text-sm text-gray-400">
        Компактный заголовок — как{' '}
        <a
          href="/legal/korruptsiya"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#ee862c] hover:underline"
        >
          /legal/korruptsiya
        </a>
        ; Hero header — как{' '}
        <a
          href="/services/transport"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#ee862c] hover:underline"
        >
          /services/transport
        </a>
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
              <th className="pb-2 pr-4 font-medium">Страница</th>
              <th className="pb-2 pr-4 font-medium">URL</th>
              <th className="pb-2 pr-4 font-medium">Подзаголовок</th>
              <th className="pb-2 pr-4 font-medium">Вёрстка</th>
              <th className="pb-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-b border-white/5 last:border-0">
                <td className="py-3 pr-4">
                  <div className="flex items-start gap-2">
                    <FontAwesomeIcon icon={faFileAlt} className="mt-0.5 text-[#ee862c]/70" />
                    <div>
                      <p className={`font-medium ${page.isActive ? 'text-white' : 'text-gray-500'}`}>
                        {page.title}
                      </p>
                      {page.group && (
                        <p className="text-xs text-gray-500">Раздел: {page.group}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <a
                    href={page.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#ee862c]/90 hover:underline"
                  >
                    {page.url}
                  </a>
                </td>
                <td className="py-3 pr-4 text-gray-400">{page.subtitle || '—'}</td>
                <td className="py-3 pr-4">
                  {page.heroHeader ? (
                    <span className="inline-flex items-center gap-1.5 rounded bg-[#ee862c]/15 px-2 py-0.5 text-xs text-[#f0ac74]">
                      <FontAwesomeIcon icon={faImage} />
                      Hero header
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">Компактный</span>
                  )}
                </td>
                <td className="py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(page.id)}
                    className="rounded p-2 text-gray-400 hover:bg-white/10 hover:text-white"
                    title="Редактировать"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
