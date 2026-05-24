import { ACTIVE_FILTER_OPTIONS } from "@/shared/constants/billableEventOptions";
import {
  FEE_ITEM_ITEMS_PER_PAGE,
  FEE_ITEM_SORT_DEFAULT,
} from "@/shared/constants/feeItemOptions";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useGetFeeItemsQuery } from "../api/feeItemApi";
import {
  FeeItemsTabActionType,
  feeItemsTabReducer,
  initialFeeItemsTabState,
} from "../state/feeItemsTabState";
import type { FeeItem } from "../types/fee-item";

const DEBOUNCE_MS = 300;

export function useFeeItemsTab() {
  const [state, dispatch] = useReducer(
    feeItemsTabReducer,
    initialFeeItemsTabState,
  );

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const queryParams = {
    page: state.page,
    itemsPerPage: FEE_ITEM_ITEMS_PER_PAGE,
    sort: FEE_ITEM_SORT_DEFAULT,
    ...(state.debouncedSearch
      ? { "search[name]": state.debouncedSearch }
      : {}),
    ...(state.isActiveFilter !== undefined
      ? { "exact[isActive]": state.isActiveFilter }
      : {}),
  };

  const { data, isLoading, isError, error: queryError, refetch } =
    useGetFeeItemsQuery(queryParams);

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isError, queryError, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isError, queryError],
  );

  const feeItems = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;
  const activeCount = feeItems.filter((item) => item.isActive).length;

  const handleSearchChange = useCallback((value: string) => {
    dispatch({ type: FeeItemsTabActionType.SetSearch, value });
    dispatch({ type: FeeItemsTabActionType.SetPage, value: 1 });

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      dispatch({
        type: FeeItemsTabActionType.SetDebouncedSearch,
        value,
      });
    }, DEBOUNCE_MS);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: FeeItemsTabActionType.SetPage, value: page });
  }, []);

  const handleIsActiveFilterChange = useCallback(
    (value: boolean | undefined) => {
      dispatch({
        type: FeeItemsTabActionType.SetIsActiveFilter,
        value,
      });
    },
    [],
  );

  const clearAllFilters = useCallback(() => {
    dispatch({ type: FeeItemsTabActionType.ClearFilters });
  }, []);

  const handleOpenCreate = useCallback(() => {
    dispatch({
      type: FeeItemsTabActionType.OpenForm,
      target: null,
    });
  }, []);

  const handleOpenEdit = useCallback((target: FeeItem) => {
    dispatch({
      type: FeeItemsTabActionType.OpenForm,
      target,
    });
  }, []);

  const handleCloseForm = useCallback(() => {
    dispatch({ type: FeeItemsTabActionType.CloseForm });
  }, []);

  const handleOpenDelete = useCallback((target: FeeItem) => {
    dispatch({
      type: FeeItemsTabActionType.OpenDelete,
      target,
    });
  }, []);

  const handleCloseDelete = useCallback(() => {
    dispatch({ type: FeeItemsTabActionType.CloseDelete });
  }, []);

  const activeFilterCount = state.isActiveFilter !== undefined ? 1 : 0;
  const hasData = feeItems.length > 0;
  const isSearchActive =
    state.search !== "" || state.isActiveFilter !== undefined;

  return {
    state: {
      feeItems,
      totalItems,
      activeCount,
      isLoading,
      isError,
      sectionError,
      search: state.search,
      page: state.page,
      isActiveFilter: state.isActiveFilter,
      formTarget: state.formTarget,
      formOpen: state.formOpen,
      deleteTarget: state.deleteTarget,
      deleteOpen: state.deleteOpen,
      activeFilterCount,
      activeFilterOptions: ACTIVE_FILTER_OPTIONS,
    },
    actions: {
      handleSearchChange,
      handlePageChange,
      handleIsActiveFilterChange,
      clearAllFilters,
      handleOpenCreate,
      handleOpenEdit,
      handleCloseForm,
      handleOpenDelete,
      handleCloseDelete,
      refetch,
    },
    flags: {
      hasData,
      isSearchActive,
    },
  };
}
