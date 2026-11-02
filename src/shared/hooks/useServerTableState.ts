import type { TablePaginationConfig } from "antd";
import type {
  FilterValue,
  SorterResult,
  TableCurrentDataSource,
} from "antd/es/table/interface";
import { useCallback, useEffect, useState } from "react";

export interface ServerTableStateOptions<TFilters extends Record<string, unknown> = Record<string, unknown>> {
  /** Initial page number (default: 1) */
  initialPage?: number;
  /** Initial page size (default: 10) */
  initialPageSize?: number;
  /** Alias for initialPageSize */
  defaultPageSize?: number;
  /** Initial sort key (e.g. "createdAt:desc") */
  initialSort?: string;
  /** Alias for initialSort */
  defaultSort?: string;
  /** Initial filter state object */
  initialFilters?: TFilters;
  /** Total items count from the server response for reactive page-clamping */
  totalItems?: number;
}

export interface UseServerTableStateResult<TFilters extends Record<string, unknown> = Record<string, unknown>> {
  page: number;
  setPage: (page: number | ((prev: number) => number)) => void;
  resetPage: () => void;
  pageSize: number;
  setPageSize: (size: number | ((prev: number) => number)) => void;
  sort: string | undefined;
  setSort: (newSort: string | undefined) => void;
  updateSort: (newSort: string | undefined) => void;
  handleSortChange: (newSort: string | undefined) => void;
  handlePageChange: (newPage: number, newPageSize?: number) => void;
  handleTableChange: <RecordType extends object = Record<string, unknown>>(
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue | null>,
    sorter: SorterResult<RecordType> | SorterResult<RecordType>[],
    extra: TableCurrentDataSource<RecordType>,
  ) => void;
  filters: TFilters;
  updateFilters: (
    updater: Partial<TFilters> | ((prev: TFilters) => TFilters),
  ) => void;
  resetFilters: () => void;
  getPaginationConfig: (
    itemsTotal?: number,
    disabled?: boolean,
  ) => TablePaginationConfig;
}

/**
 * useServerTableState — Unified state management primitive for server-side paginated tables.
 *
 * Invariants Enforced:
 * 1. P2: Any filter update or sort change automatically resets `page` to 1.
 * 2. P2: Any page size change automatically resets `page` to 1.
 * 3. P3: Reactive page clamp — steps back when data shrinks due to single/bulk deletes or external mutations.
 * 4. P4: Standard Ant Design pagination configuration with `showTotal` and `showSizeChanger`.
 */
export function useServerTableState<TFilters extends Record<string, unknown> = Record<string, unknown>>({
  initialPage = 1,
  initialPageSize,
  defaultPageSize = 10,
  initialSort,
  defaultSort,
  initialFilters = {} as TFilters,
  totalItems,
}: ServerTableStateOptions<TFilters> = {}): UseServerTableStateResult<TFilters> {
  const effectivePageSize = initialPageSize ?? defaultPageSize;
  const effectiveSort = initialSort ?? defaultSort;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(effectivePageSize);
  const [sort, setSortState] = useState<string | undefined>(effectiveSort);
  const [filters, setFilters] = useState<TFilters>(initialFilters);

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  // Invariant P2: Filter mutations automatically reset page to 1
  const updateFilters = useCallback(
    (updater: Partial<TFilters> | ((prev: TFilters) => TFilters)) => {
      setFilters((prev) => {
        const next =
          typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
        return next;
      });
      setPage(1);
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setPage(1);
  }, [initialFilters]);

  // Invariant P2: Sort mutations automatically reset page to 1
  const updateSort = useCallback((newSort: string | undefined) => {
    setSortState(newSort);
    setPage(1);
  }, []);

  const handlePageChange = useCallback(
    (newPage: number, newPageSize?: number) => {
      if (newPageSize && newPageSize !== pageSize) {
        setPageSize(newPageSize);
        setPage(1);
      } else {
        setPage(newPage);
      }
    },
    [pageSize],
  );

  // Invariant P3: Reactive Page Clamp
  // Covers single delete, bulk delete, external mutations, and filter shrinks
  useEffect(() => {
    if (totalItems !== undefined && totalItems >= 0) {
      const lastPage = Math.max(1, Math.ceil(totalItems / pageSize));
      if (page > lastPage) {
        setPage(lastPage);
      }
    }
  }, [totalItems, pageSize, page]);

  // Invariant P4: Standardized Ant Design Pagination Config
  const getPaginationConfig = useCallback(
    (itemsTotal?: number, disabled = false): TablePaginationConfig => {
      const effectiveTotal = itemsTotal ?? totalItems ?? 0;
      return {
        current: page,
        pageSize,
        total: effectiveTotal,
        showSizeChanger: true,
        disabled,
        showTotal: (total: number, range: [number, number]) =>
          `${range[0]}-${range[1]} of ${total} items`,
        onChange: handlePageChange,
      };
    },
    [page, pageSize, totalItems, handlePageChange],
  );

  const handleTableChange = useCallback(
    <RecordType extends object = Record<string, unknown>>(
      pagination: TablePaginationConfig,
      _filters: Record<string, FilterValue | null>,
      sorter: SorterResult<RecordType> | SorterResult<RecordType>[],
      extra: TableCurrentDataSource<RecordType>,
    ) => {
      if (extra?.action === "paginate") {
        handlePageChange(pagination.current ?? 1, pagination.pageSize);
        return;
      }

      if (extra?.action === "sort") {
        const s = Array.isArray(sorter) ? sorter[0] : sorter;
        if (!s || !s.columnKey || !s.order) {
          updateSort(effectiveSort);
          return;
        }
        updateSort(`${String(s.columnKey)}:${s.order === "ascend" ? "asc" : "desc"}`);
        return;
      }

      // Defensive fallback for synthetic calls lacking extra.action
      if (
        !extra?.action &&
        ((pagination.current !== undefined && pagination.current !== page) ||
          (pagination.pageSize !== undefined && pagination.pageSize !== pageSize))
      ) {
        handlePageChange(pagination.current ?? 1, pagination.pageSize);
      }
    },
    [handlePageChange, updateSort, effectiveSort, page, pageSize],
  );

  return {
    page,
    setPage,
    resetPage,
    pageSize,
    setPageSize,
    sort,
    setSort: updateSort,
    updateSort,
    handleSortChange: updateSort,
    handlePageChange,
    handleTableChange,
    filters,
    updateFilters,
    resetFilters,
    getPaginationConfig,
  };
}

export default useServerTableState;

