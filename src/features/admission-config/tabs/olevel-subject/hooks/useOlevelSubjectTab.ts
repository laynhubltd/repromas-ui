import { OLEVEL_SUBJECT_SORT_DEFAULT } from "@/shared/constants/olevelSubjectOptions";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Modal, notification } from "antd";
import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  useGetOlevelSubjectsQuery,
  usePopulateOlevelSubjectsMutation,
} from "../api/olevelSubjectApi";
import {
  initialOlevelSubjectTabState,
  olevelSubjectTabReducer,
  OlevelSubjectTabActionType,
} from "../state/olevelSubjectTabState";
import type { OlevelSubject } from "../types/olevel-subject";

const ITEMS_PER_PAGE = 30;
const DEBOUNCE_MS = 300;

export function useOlevelSubjectTab() {
  const [state, dispatch] = useReducer(
    olevelSubjectTabReducer,
    initialOlevelSubjectTabState,
  );

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const queryParams = {
    page: state.page,
    itemsPerPage: ITEMS_PER_PAGE,
    sort: OLEVEL_SUBJECT_SORT_DEFAULT,
    ...(state.debouncedSearch
      ? { "search[name]": state.debouncedSearch }
      : {}),
  };

  const { data, isLoading, isError, refetch } =
    useGetOlevelSubjectsQuery(queryParams);

  const [populateOlevelSubjects, { isLoading: isPopulating }] =
    usePopulateOlevelSubjectsMutation();

  const subjects = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  const handleSearchChange = useCallback((value: string) => {
    dispatch({ type: OlevelSubjectTabActionType.SetSearch, value });
    dispatch({ type: OlevelSubjectTabActionType.SetPage, value: 1 });

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      dispatch({
        type: OlevelSubjectTabActionType.SetDebouncedSearch,
        value,
      });
    }, DEBOUNCE_MS);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: OlevelSubjectTabActionType.SetPage, value: page });
  }, []);

  const handleOpenCreate = useCallback(() => {
    dispatch({
      type: OlevelSubjectTabActionType.OpenForm,
      target: null,
    });
  }, []);

  const handleOpenEdit = useCallback((target: OlevelSubject) => {
    dispatch({
      type: OlevelSubjectTabActionType.OpenForm,
      target,
    });
  }, []);

  const handleCloseForm = useCallback(() => {
    dispatch({ type: OlevelSubjectTabActionType.CloseForm });
  }, []);

  const handleOpenDelete = useCallback((target: OlevelSubject) => {
    dispatch({
      type: OlevelSubjectTabActionType.OpenDelete,
      target,
    });
  }, []);

  const handleCloseDelete = useCallback(() => {
    dispatch({ type: OlevelSubjectTabActionType.CloseDelete });
  }, []);

  const handlePopulate = useCallback(() => {
    Modal.confirm({
      title: "Initialize standard subjects?",
      content:
        "This loads the default WAEC/NECO subject catalog for your tenant. Existing subjects are updated or skipped — nothing is deleted.",
      okText: "Populate",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const result = await populateOlevelSubjects().unwrap();
          notification.success({
            message: `Catalog updated: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped.`,
          });
        } catch (err: unknown) {
          const parsed = parseApiError(err);
          notification.error({ message: parsed.message });
        }
      },
    });
  }, [populateOlevelSubjects]);

  const hasData = subjects.length > 0;
  const isSearchActive = state.search !== "";

  return {
    state: {
      subjects,
      totalItems,
      isLoading,
      isError,
      isPopulating,
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
      handlePopulate,
      refetch,
    },
    flags: {
      hasData,
      isSearchActive,
    },
  };
}
