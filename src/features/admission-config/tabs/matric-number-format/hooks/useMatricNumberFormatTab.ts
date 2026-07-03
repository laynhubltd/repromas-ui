import { MATRIC_NUMBER_FORMAT_ITEMS_PER_PAGE } from "@/shared/constants/matricNumberFormatOptions";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { RequestScreen } from "@/shared/types/error-ui";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import {
  useGetMatricNumberFormatPrerequisitesQuery,
  useGetMatricNumberFormatsQuery,
} from "../api/matricNumberFormatApi";
import {
  MatricNumberFormatTabActionType,
  initialMatricNumberFormatTabState,
  matricNumberFormatTabReducer,
} from "../state/matricNumberFormatTabState";
import type { MatricNumberFormat } from "../types/matric-number-format";
import { normalizeMatricPrerequisites } from "../utils/templateTokenHelpers";

export function useMatricNumberFormatTab() {
  const [state, dispatch] = useReducer(
    matricNumberFormatTabReducer,
    initialMatricNumberFormatTabState,
  );
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const queryParams = {
    page: state.page,
    itemsPerPage: MATRIC_NUMBER_FORMAT_ITEMS_PER_PAGE,
    sort: "updatedAt:desc",
    ...(state.debouncedSearch ? { "search[code]": state.debouncedSearch } : {}),
    ...(state.statusFilter ? { "exact[status]": state.statusFilter } : {}),
  };

  const { data, isLoading, isError, error, refetch } =
    useGetMatricNumberFormatsQuery(queryParams);

  const { data: prerequisites } = useGetMatricNumberFormatPrerequisitesQuery();

  const formats = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  const activeFormat = useMemo(
    () => formats.find((f) => f.status === "ACTIVE") ?? null,
    [formats],
  );

  const draftCount = useMemo(
    () => formats.filter((f) => f.status === "DRAFT").length,
    [formats],
  );

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isError, error, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isError, error],
  );

  const activeFilterCount = state.statusFilter !== undefined ? 1 : 0;
  const isFilterActive = activeFilterCount > 0;
  const isSearchActive = state.search.trim().length > 0;
  const hasData = formats.length > 0;

  const handleSearchChange = useCallback((value: string) => {
    dispatch({ type: MatricNumberFormatTabActionType.SetSearch, value });
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      dispatch({ type: MatricNumberFormatTabActionType.SetDebouncedSearch, value });
    }, 300);
  }, []);

  const handleStatusFilterChange = useCallback(
    (value: import("../types/matric-number-format").MatricFormatStatus | undefined) => {
      dispatch({ type: MatricNumberFormatTabActionType.SetStatusFilter, value });
    },
    [],
  );

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: MatricNumberFormatTabActionType.SetPage, value: page });
  }, []);

  const handleOpenCreate = useCallback(() => {
    dispatch({ type: MatricNumberFormatTabActionType.OpenCreate });
  }, []);

  const handleCloseCreate = useCallback(() => {
    dispatch({ type: MatricNumberFormatTabActionType.CloseCreate });
  }, []);

  const handleOpenBuilder = useCallback((format: MatricNumberFormat, readOnly: boolean) => {
    dispatch({
      type: MatricNumberFormatTabActionType.OpenBuilder,
      formatId: format.id,
      readOnly,
    });
  }, []);

  const handleCloseBuilder = useCallback(() => {
    dispatch({ type: MatricNumberFormatTabActionType.CloseBuilder });
  }, []);

  const handleOpenDuplicate = useCallback((format: MatricNumberFormat) => {
    dispatch({ type: MatricNumberFormatTabActionType.OpenDuplicate, target: format });
  }, []);

  const handleCloseDuplicate = useCallback(() => {
    dispatch({ type: MatricNumberFormatTabActionType.CloseDuplicate });
  }, []);

  const handleOpenActivate = useCallback((format: MatricNumberFormat) => {
    dispatch({ type: MatricNumberFormatTabActionType.OpenActivate, target: format });
  }, []);

  const handleCloseActivate = useCallback(() => {
    dispatch({ type: MatricNumberFormatTabActionType.CloseActivate });
  }, []);

  const handleCreated = useCallback((format: MatricNumberFormat) => {
    handleOpenBuilder(format, false);
  }, [handleOpenBuilder]);

  const handleDuplicated = useCallback((format: MatricNumberFormat) => {
    handleOpenBuilder(format, false);
  }, [handleOpenBuilder]);

  const clearAllFilters = useCallback(() => {
    dispatch({ type: MatricNumberFormatTabActionType.SetStatusFilter, value: undefined });
  }, []);

  return {
    state: {
      formats,
      totalItems,
      isLoading,
      isError,
      sectionError,
      activeFormat,
      draftCount,
      prerequisites,
      search: state.search,
      statusFilter: state.statusFilter,
      page: state.page,
      builderFormatId: state.builderFormatId,
      builderReadOnly: state.builderReadOnly,
      builderOpen: state.builderOpen,
      createOpen: state.createOpen,
      duplicateTarget: state.duplicateTarget,
      activateTarget: state.activateTarget,
    },
    actions: {
      handleSearchChange,
      handleStatusFilterChange,
      handlePageChange,
      handleOpenCreate,
      handleCloseCreate,
      handleOpenBuilder,
      handleCloseBuilder,
      handleOpenDuplicate,
      handleCloseDuplicate,
      handleOpenActivate,
      handleCloseActivate,
      handleCreated,
      handleDuplicated,
      clearAllFilters,
      refetch,
    },
    flags: {
      hasData,
      isFilterActive,
      isSearchActive,
      activeFilterCount,
      prerequisitesReady: normalizeMatricPrerequisites(prerequisites)?.ready ?? false,
    },
  };
}
