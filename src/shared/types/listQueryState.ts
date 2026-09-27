import type { TablePaginationConfig } from "antd";

/**
 * ListQueryState — Standard structural interface for tab and list query hooks.
 * Enforces that hooks export both `isLoading` (cold cache) and `isFetching` (background refetch),
 * along with standardized pagination and table states.
 */
export interface ListQueryState<TRecord> {
  items: TRecord[];
  totalItems: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  page: number;
  pageSize: number;
  sort?: string;
  paginationConfig: TablePaginationConfig;
  refetch: () => void;
}
