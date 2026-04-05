import { notification } from "antd";
import type { SorterResult } from "antd/es/table/interface";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    useActivateCurriculumVersionMutation,
    useGetCurriculumVersionsQuery,
} from "../api/curriculumVersionApi";
import type { CurriculumVersion } from "../types/curriculum-version";

export type StatusFilter = "all" | "active" | "inactive";

export const ITEMS_PER_PAGE = 30;

export function statusFilterToQueryParam(filter: StatusFilter): boolean | undefined {
  if (filter === "active") return true;
  if (filter === "inactive") return false;
  return undefined;
}

export function getStatusTag(isActive: boolean): { color: string | undefined; label: string } {
  return isActive
    ? { color: "green", label: "Active" }
    : { color: undefined, label: "Inactive" };
}

export function calcTotalPages(totalItems: number, itemsPerPage: number): number {
  if (itemsPerPage <= 0) return 0;
  return Math.ceil(totalItems / itemsPerPage);
}

export function getMenuItems(
  isActiveForAdmission: boolean,
): Array<{ key: string; label: string; disabled?: boolean; danger?: boolean }> {
  return [
    { key: "edit", label: "Edit" },
    { key: "activate", label: "Activate", disabled: isActiveForAdmission },
    { key: "delete", label: "Delete", danger: true },
  ];
}

export function resetPageOnFilterChange(
  prevSearch: string,
  nextSearch: string,
  prevFilter: StatusFilter,
  nextFilter: StatusFilter,
  currentPage: number,
): number {
  const changed = prevSearch !== nextSearch || prevFilter !== nextFilter;
  return changed ? 1 : currentPage;
}

export function useCurriculumVersionTab() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState("createdAt:desc");
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CurriculumVersion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CurriculumVersion | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const handleFilterChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setPage(1);
  };

  const isActiveParam = statusFilterToQueryParam(statusFilter);
  const queryParams = {
    page,
    itemsPerPage: ITEMS_PER_PAGE,
    sort,
    ...(debouncedSearch ? { "search[name]": debouncedSearch } : {}),
    ...(isActiveParam !== undefined ? { "boolean[isActiveForAdmission]": isActiveParam } : {}),
  };

  const { data, isLoading, isError, refetch } = useGetCurriculumVersionsQuery(queryParams);
  const [activateCurriculumVersion] = useActivateCurriculumVersionMutation();

  const versions = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  const handleActivate = async (record: CurriculumVersion) => {
    try {
      await activateCurriculumVersion({ id: record.id }).unwrap();
      notification.success({ message: "Version activated successfully" });
      window.dispatchEvent(new CustomEvent("curriculumVersionActivated"));
    } catch {
      notification.error({
        message: "Activation failed",
        description: `Could not activate "${record.name}". Please try again.`,
      });
    }
  };

  const handleSortChange = (
    _: unknown,
    __: unknown,
    sorter: SorterResult<CurriculumVersion> | SorterResult<CurriculumVersion>[],
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (!s.columnKey || !s.order) {
      setSort("createdAt:desc");
      return;
    }
    setSort(`${String(s.columnKey)}:${s.order === "ascend" ? "asc" : "desc"}`);
  };

  return {
    state: {
      search,
      statusFilter,
      sort,
      page,
      createModalOpen,
      editTarget,
      deleteTarget,
      versions,
      totalItems,
      isLoading,
      isError,
      debounceTimer,
    },
    actions: {
      handleSearchChange,
      handleFilterChange,
      handleActivate,
      handleSortChange,
      setCreateModalOpen,
      setEditTarget,
      setDeleteTarget,
      setPage,
      refetch,
    },
  };
}
