import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useCallback, useMemo, useReducer, useRef } from "react";
import { useGetDocumentTypesQuery } from "../api/documentTypeApi";
import {
  DocumentTypeTabActionType,
  documentTypeTabReducer,
  initialDocumentTypeTabState,
} from "../state/documentTypeTabState";
import type { AdmissionDocumentType } from "../types/document-type";

const ITEMS_PER_PAGE = 30;
const DEFAULT_SORT = "isActive:desc,name:asc";

export function useDocumentTypeTab() {
  const [state, dispatch] = useReducer(
    documentTypeTabReducer,
    initialDocumentTypeTabState,
  );

  // ─── Debounce timer ───────────────────────────────────────────────────────
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Query ────────────────────────────────────────────────────────────────
  const queryParams = {
    page: state.page,
    itemsPerPage: ITEMS_PER_PAGE,
    sort: DEFAULT_SORT,
    ...(state.debouncedSearch ? { "search[name]": state.debouncedSearch } : {}),
    ...(state.isActiveFilter !== undefined
      ? { "exact[isActive]": state.isActiveFilter }
      : {}),
    ...(state.isRequiredFilter !== undefined
      ? { "exact[isRequired]": state.isRequiredFilter }
      : {}),
  };

  const {
    data,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useGetDocumentTypesQuery(queryParams);

  const documentTypes = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isError, queryError, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isError, queryError],
  );

  // ─── Derived flags ────────────────────────────────────────────────────────
  const hasData = documentTypes.length > 0;
  const isFilterActive =
    state.isActiveFilter !== undefined ||
    state.isRequiredFilter !== undefined;
  const isSearchActive = state.search.trim().length > 0;
  const activeFilterCount = [state.isActiveFilter, state.isRequiredFilter].filter(
    (v) => v !== undefined,
  ).length;

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleSearchChange = useCallback((value: string) => {
    dispatch({ type: DocumentTypeTabActionType.SetSearch, value });
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      dispatch({ type: DocumentTypeTabActionType.SetDebouncedSearch, value });
    }, 300);
  }, []);

  const handleIsActiveFilterChange = useCallback(
    (value: boolean | undefined) => {
      dispatch({ type: DocumentTypeTabActionType.SetIsActiveFilter, value });
    },
    [],
  );

  const handleIsRequiredFilterChange = useCallback(
    (value: boolean | undefined) => {
      dispatch({ type: DocumentTypeTabActionType.SetIsRequiredFilter, value });
    },
    [],
  );

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: DocumentTypeTabActionType.SetPage, page });
  }, []);

  const handleOpenCreate = useCallback(() => {
    dispatch({ type: DocumentTypeTabActionType.OpenForm, target: null });
  }, []);

  const handleOpenEdit = useCallback((target: AdmissionDocumentType) => {
    dispatch({ type: DocumentTypeTabActionType.OpenForm, target });
  }, []);

  const handleCloseForm = useCallback(() => {
    dispatch({ type: DocumentTypeTabActionType.CloseForm });
  }, []);

  const handleOpenDelete = useCallback((target: AdmissionDocumentType) => {
    dispatch({ type: DocumentTypeTabActionType.OpenDelete, target });
  }, []);

  const handleCloseDelete = useCallback(() => {
    dispatch({ type: DocumentTypeTabActionType.CloseDelete });
  }, []);

  const clearAllFilters = useCallback(() => {
    dispatch({ type: DocumentTypeTabActionType.SetIsActiveFilter, value: undefined });
    dispatch({ type: DocumentTypeTabActionType.SetIsRequiredFilter, value: undefined });
    dispatch({ type: DocumentTypeTabActionType.SetSearch, value: "" });
    dispatch({ type: DocumentTypeTabActionType.SetDebouncedSearch, value: "" });
  }, []);

  return {
    state: {
      documentTypes,
      totalItems,
      isLoading,
      isError,
      sectionError,
      search: state.search,
      isActiveFilter: state.isActiveFilter,
      isRequiredFilter: state.isRequiredFilter,
      page: state.page,
      itemsPerPage: ITEMS_PER_PAGE,
      formTarget: state.formTarget,
      formOpen: state.formOpen,
      deleteTarget: state.deleteTarget,
    },
    actions: {
      handleSearchChange,
      handleIsActiveFilterChange,
      handleIsRequiredFilterChange,
      handlePageChange,
      handleOpenCreate,
      handleOpenEdit,
      handleCloseForm,
      handleOpenDelete,
      handleCloseDelete,
      clearAllFilters,
      refetch,
    },
    flags: {
      hasData,
      isFilterActive,
      isSearchActive,
      activeFilterCount,
    },
  };
}
