import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { notification } from "antd";
import type { SorterResult } from "antd/es/table/interface";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useActivateCurriculumVersionMutation,
  useGetCurriculumVersionsQuery,
} from "../api/curriculumVersionApi";
import type { CurriculumScope, CurriculumVersion } from "../types/curriculum-version";

export type StatusFilter = "all" | "active" | "inactive";
export type ScopeFilter = "all" | CurriculumScope;

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
    { key: "clone", label: "Clone / Branch" },
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
  const handleApiError = useApiError();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");
  const [sort, setSort] = useState("createdAt:desc");
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [cloneTarget, setCloneTarget] = useState<CurriculumVersion | null>(null);
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

  const handleScopeFilterChange = (value: ScopeFilter) => {
    setScopeFilter(value);
    setPage(1);
  };

  const isActiveParam = statusFilterToQueryParam(statusFilter);
  const queryParams = {
    page,
    itemsPerPage: ITEMS_PER_PAGE,
    sort,
    include: "program",
    ...(debouncedSearch ? { "search[name]": debouncedSearch } : {}),
    ...(isActiveParam !== undefined ? { "boolean[isActiveForAdmission]": isActiveParam } : {}),
    ...(scopeFilter !== "all" ? { "exact[scope]": scopeFilter } : {}),
  };

  const { data, isLoading, isError, error: queryError, refetch } = useGetCurriculumVersionsQuery(queryParams);
  const [activateCurriculumVersion] = useActivateCurriculumVersionMutation();

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isError, queryError, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isError, queryError],
  );

  const versions = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  const handleActivate = async (record: CurriculumVersion) => {
    try {
      await activateCurriculumVersion({ id: record.id }).unwrap();
      const scopeLabel =
        record.scope === "PROGRAM"
          ? `${record.program?.name ?? "Program"} admission`
          : "Global admission";
      notification.success({ message: `Version activated for ${scopeLabel}` });
      window.dispatchEvent(new CustomEvent("curriculumVersionActivated"));
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
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
      scopeFilter,
      sort,
      page,
      createModalOpen,
      cloneTarget,
      editTarget,
      deleteTarget,
      versions,
      totalItems,
      isLoading,
      isError,
      sectionError,
      debounceTimer,
    },
    actions: {
      handleSearchChange,
      handleFilterChange,
      handleScopeFilterChange,
      handleActivate,
      handleSortChange,
      setCreateModalOpen,
      setCloneTarget,
      setEditTarget,
      setDeleteTarget,
      setPage,
      refetch,
    },
  };
}

