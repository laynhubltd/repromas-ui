import type { TablePaginationConfig } from "antd";
import type {
  FilterValue,
  SorterResult,
  TableCurrentDataSource,
} from "antd/es/table/interface";

export interface TableChangeHandlerOptions {
  onPageChange: (page: number, pageSize?: number) => void;
  onSortChange: (sort: string) => void;
  defaultSort?: string;
  isSortFieldAllowed?: (field: string) => boolean;
}

/**
 * createTableChangeHandler — Reusable, strongly-typed Ant Design Table onChange handler
 * that properly separates pagination and sorting state changes.
 */
export function createTableChangeHandler<RecordType extends object = object>({
  onPageChange,
  onSortChange,
  defaultSort,
  isSortFieldAllowed,
}: TableChangeHandlerOptions) {
  return (
    pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    sorter: SorterResult<RecordType> | SorterResult<RecordType>[],
    extra: TableCurrentDataSource<RecordType>,
  ): void => {
    // 1. Pagination action
    if (extra?.action === "paginate") {
      onPageChange(pagination.current ?? 1, pagination.pageSize);
      return;
    }

    // 2. Sort action
    if (extra?.action === "sort") {
      const s = Array.isArray(sorter) ? sorter[0] : sorter;
      if (!s || !s.columnKey || !s.order) {
        if (defaultSort) {
          onSortChange(defaultSort);
        }
        return;
      }

      const field = String(s.columnKey);
      if (!isSortFieldAllowed || isSortFieldAllowed(field)) {
        onSortChange(`${field}:${s.order === "ascend" ? "asc" : "desc"}`);
      }
      return;
    }

    // 3. Defensive fallback for synthetic calls without extra.action
    if (!extra?.action && pagination.current !== undefined) {
      onPageChange(pagination.current, pagination.pageSize);
    }
  };
}

