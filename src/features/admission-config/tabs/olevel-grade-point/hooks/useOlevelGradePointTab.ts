import {
  OLEVEL_GRADE_POINT_ITEMS_PER_PAGE,
  OLEVEL_GRADE_POINT_SORT_DEFAULT,
} from "@/shared/constants/olevelGradePointOptions";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { useGetOlevelGradePointsQuery } from "../api/olevelGradePointApi";
import {
  initialOlevelGradePointTabState,
  olevelGradePointTabReducer,
  OlevelGradePointTabActionType,
} from "../state/olevelGradePointTabState";
import type { OlevelGradePoint } from "../types/olevel-grade-point";

const DEBOUNCE_MS = 300;

export function useOlevelGradePointTab() {
  const [state, dispatch] = useReducer(
    olevelGradePointTabReducer,
    initialOlevelGradePointTabState,
  );

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const queryParams = {
    page: state.page,
    itemsPerPage: OLEVEL_GRADE_POINT_ITEMS_PER_PAGE,
    sort: OLEVEL_GRADE_POINT_SORT_DEFAULT,
    ...(state.debouncedSearch
      ? { "search[grade]": state.debouncedSearch }
      : {}),
  };

  const { data, isLoading, isError, refetch } =
    useGetOlevelGradePointsQuery(queryParams);

  const gradePoints = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;
  const maxPoints =
    gradePoints.length > 0
      ? Math.max(...gradePoints.map((item) => item.points))
      : 0;

  const handleSearchChange = useCallback((value: string) => {
    dispatch({ type: OlevelGradePointTabActionType.SetSearch, value });
    dispatch({ type: OlevelGradePointTabActionType.SetPage, value: 1 });

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      dispatch({
        type: OlevelGradePointTabActionType.SetDebouncedSearch,
        value,
      });
    }, DEBOUNCE_MS);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: OlevelGradePointTabActionType.SetPage, value: page });
  }, []);

  const handleOpenCreate = useCallback(() => {
    dispatch({
      type: OlevelGradePointTabActionType.OpenForm,
      target: null,
    });
  }, []);

  const handleOpenEdit = useCallback((target: OlevelGradePoint) => {
    dispatch({
      type: OlevelGradePointTabActionType.OpenForm,
      target,
    });
  }, []);

  const handleCloseForm = useCallback(() => {
    dispatch({ type: OlevelGradePointTabActionType.CloseForm });
  }, []);

  const handleOpenDelete = useCallback((target: OlevelGradePoint) => {
    dispatch({
      type: OlevelGradePointTabActionType.OpenDelete,
      target,
    });
  }, []);

  const handleCloseDelete = useCallback(() => {
    dispatch({ type: OlevelGradePointTabActionType.CloseDelete });
  }, []);

  const hasData = gradePoints.length > 0;
  const isSearchActive = state.search !== "";

  return {
    state: {
      gradePoints,
      totalItems,
      maxPoints,
      isLoading,
      isError,
      search: state.search,
      page: state.page,
      formTarget: state.formTarget,
      formOpen: state.formOpen,
      deleteTarget: state.deleteTarget,
      deleteOpen: state.deleteOpen,
    },
    actions: {
      handleSearchChange,
      handlePageChange,
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
