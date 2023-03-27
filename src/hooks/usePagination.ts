import { useCallback, useMemo, useState } from 'react';

export type PaginationOptions = {
  rowsPerPage?: number;
  rowsPerPageOptions?: number[];
  shownPages?: number;
};

type PaginationResult = {
  end: number;
  page: number;
  paginate: <T,>(items: Array<T>) => Array<T>;
  reset: () => void;
  setCount: (number: number) => void;
  rowsPerPage: number;
  hasMore: boolean;
  hasLess: boolean;
  previous: () => void;
  next: () => void;
  limit: number;
  offset: number;
};

export const DEFAULT_ROWS_PER_PAGE = 15;
const DEFAULT_SHOWN_PAGES = 3;

function usePagination(options?: PaginationOptions): PaginationResult {
  const [count, setCount] = useState(0);
  const [rowsPerPage] = useState(options?.rowsPerPage ?? DEFAULT_ROWS_PER_PAGE);
  const [page, setPage] = useState(1);
  const shownPages = useMemo(() => options?.shownPages ?? DEFAULT_SHOWN_PAGES, [options?.shownPages]);
  const offset =  (page - 1) * rowsPerPage;
  const end = (page - 1 + shownPages) * rowsPerPage;
  const start = (page - 1) * rowsPerPage

  const reset = useCallback(() => {
    setPage(1);
  }, []);
  
  const hasLess = page > 1;
  const hasMore = count > end;

  const next = useCallback(() => {
    if (hasMore) {
      setPage((p) => p + 1);
    }
  }, [hasMore]);

  const previous = useCallback(() => {
    if (hasLess) {
      setPage((p) => p - 1);
    }
  }, [hasLess]);
  
  const paginate = useCallback<PaginationResult['paginate']>(
    (items) => items.slice().reverse().slice(start, end).reverse(),
    [end, start]
  );
  
  return useMemo(() => ({
    count,
    end,
    hasLess,
    hasMore,
    rowsPerPage,
    setCount,
    page,
    paginate,
    previous,
    start,
    reset,
    next,
    limit: rowsPerPage,
    offset
  }), [count, end, hasLess, hasMore, next, offset, page, paginate, previous, reset, rowsPerPage, start]);
}

export default usePagination;
