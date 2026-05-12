// src/modules/admin/components/Pagination.tsx - Компонент пагинации
'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faStepBackward,
  faStepForward,
} from '@fortawesome/free-solid-svg-icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  pageSize = 50,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // Вычисляем диапазон отображаемых страниц (до 5 кнопок)
  const getPageNumbers = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      // Показываем все страницы
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Всегда показываем первую
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Корректируем, если в начале
      if (currentPage <= 3) {
        start = 2;
        end = Math.min(maxVisible, totalPages - 1);
      }

      // Корректируем, если в конце
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - maxVisible + 1);
        end = totalPages - 1;
      }

      if (start > 2) pages.push('ellipsis');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('ellipsis');

      // Всегда показываем последнюю
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
      {/* Информация о количестве */}
      <div className="text-sm text-gray-500">
        Показано{' '}
        <span className="font-medium text-gray-400">
          {startItem}–{endItem}
        </span>{' '}
        из <span className="font-medium text-gray-400">{totalItems}</span> игроков
      </div>

      {/* Кнопки пагинации */}
      <div className="flex items-center gap-1">
        {/* Первая страница */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center text-xs text-gray-500 border border-white/10 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Первая страница"
        >
          <FontAwesomeIcon icon={faStepBackward} className="text-[10px]" />
        </button>

        {/* Назад */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center text-xs text-gray-400 border border-white/10 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        {/* Номера страниц */}
        {pageNumbers.map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-8 w-8 items-center justify-center text-xs text-gray-600"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`flex h-8 min-w-[32px] items-center justify-center px-2 text-xs font-medium border transition-colors ${
                page === currentPage
                  ? 'border-[#ee862c] text-[#ee862c] bg-[#ee862c]/10'
                  : 'border-white/10 text-gray-400 hover:text-white hover:border-white/30'
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Вперёд */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center text-xs text-gray-400 border border-white/10 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>

        {/* Последняя страница */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center text-xs text-gray-500 border border-white/10 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Последняя страница"
        >
          <FontAwesomeIcon icon={faStepForward} className="text-[10px]" />
        </button>
      </div>
    </div>
  );
}
