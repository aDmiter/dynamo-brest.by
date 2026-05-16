// src/modules/admin/components/AdminPagination.tsx — пагинация через URL (SSR)
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faStepBackward,
  faStepForward,
} from '@fortawesome/free-solid-svg-icons';

interface AdminPaginationProps {
  basePath: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  itemLabel?: string;
}

function pageHref(basePath: string, page: number) {
  if (page <= 1) return basePath;
  return `${basePath}?page=${page}`;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }

  pages.push(1);

  let start = Math.max(2, currentPage - 1);
  let end = Math.min(totalPages - 1, currentPage + 1);

  if (currentPage <= 3) {
    start = 2;
    end = Math.min(maxVisible, totalPages - 1);
  }

  if (currentPage >= totalPages - 2) {
    start = Math.max(2, totalPages - maxVisible + 1);
    end = totalPages - 1;
  }

  if (start > 2) pages.push('ellipsis');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push('ellipsis');

  pages.push(totalPages);
  return pages;
}

const navBtn =
  'flex h-8 w-8 items-center justify-center text-xs border border-white/10 transition-colors';
const navBtnEnabled = `${navBtn} text-gray-400 hover:text-white hover:border-white/30`;
const navBtnDisabled = `${navBtn} text-gray-500 opacity-30 pointer-events-none`;

export default function AdminPagination({
  basePath,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  itemLabel = 'записей',
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="mt-4 flex flex-col items-center gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-between">
      <div className="text-sm text-gray-500">
        Показано{' '}
        <span className="font-medium text-gray-400">
          {startItem}–{endItem}
        </span>{' '}
        из <span className="font-medium text-gray-400">{totalItems}</span> {itemLabel}
      </div>

      <div className="flex items-center gap-1">
        <Link
          href={pageHref(basePath, 1)}
          className={currentPage === 1 ? navBtnDisabled : navBtnEnabled}
          aria-disabled={currentPage === 1}
          title="Первая страница"
        >
          <FontAwesomeIcon icon={faStepBackward} className="text-[10px]" />
        </Link>

        <Link
          href={pageHref(basePath, currentPage - 1)}
          className={currentPage === 1 ? navBtnDisabled : navBtnEnabled}
          aria-disabled={currentPage === 1}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </Link>

        {pageNumbers.map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-8 w-8 items-center justify-center text-xs text-gray-600"
            >
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={pageHref(basePath, page)}
              className={`flex h-8 min-w-[32px] items-center justify-center px-2 text-xs font-medium border transition-colors ${
                page === currentPage
                  ? 'border-[#ee862c] text-[#ee862c] bg-[#ee862c]/10'
                  : 'border-white/10 text-gray-400 hover:text-white hover:border-white/30'
              }`}
            >
              {page}
            </Link>
          )
        )}

        <Link
          href={pageHref(basePath, currentPage + 1)}
          className={currentPage === totalPages ? navBtnDisabled : navBtnEnabled}
          aria-disabled={currentPage === totalPages}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </Link>

        <Link
          href={pageHref(basePath, totalPages)}
          className={currentPage === totalPages ? navBtnDisabled : navBtnEnabled}
          aria-disabled={currentPage === totalPages}
          title="Последняя страница"
        >
          <FontAwesomeIcon icon={faStepForward} className="text-[10px]" />
        </Link>
      </div>
    </div>
  );
}
