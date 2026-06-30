import {
  PRIOR_QUALIFICATION_TYPE_LIST_ITEMS_PER_PAGE,
  PRIOR_QUALIFICATION_TYPE_SORT_DEFAULT,
} from "@/shared/constants/priorQualificationTypeOptions";
import { useAccessControl } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { Modal } from "antd";
import { useCallback, useMemo, useReducer, useRef } from "react";
import {
  useCreatePriorQualificationTypeMutation,
  useGetPriorQualificationTypesQuery,
} from "../api/priorQualificationTypeApi";
import {
  QualificationTypeTabActionType,
  initialQualificationTypeTabState,
  qualificationTypeTabReducer,
} from "../state/qualificationTypeTabState";
import type { PriorQualificationType } from "../types/prior-qualification-type";
import { importPriorQualificationTypeDefaults } from "../utils/importDefaults";

export function useQualificationTypeTab() {
  const [state, dispatch] = useReducer(
    qualificationTypeTabReducer,
    initialQualificationTypeTabState,
  );

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleApiError = useApiError();
  const { hasPermission } = useAccessControl();

  const canEdit = hasPermission(Permission.AdmissionPriorQualificationTypesUpdate);
  const canDelete = hasPermission(Permission.AdmissionPriorQualificationTypesDelete);

  const queryParams = {
    page: state.page,
    itemsPerPage: PRIOR_QUALIFICATION_TYPE_LIST_ITEMS_PER_PAGE,
    sort: PRIOR_QUALIFICATION_TYPE_SORT_DEFAULT,
    ...(state.debouncedSearch ? { "search[name]": state.debouncedSearch } : {}),
    ...(state.isActiveFilter !== undefined
      ? { "exact[isActive]": state.isActiveFilter }
      : {}),
    ...(state.assessmentFormatFilter !== undefined
      ? { "exact[assessmentFormat]": state.assessmentFormatFilter }
      : {}),
  };

  const {
    data,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useGetPriorQualificationTypesQuery(queryParams);

  const [createType, { isLoading: isImporting }] =
    useCreatePriorQualificationTypeMutation();

  const qualificationTypes = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isError, queryError, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isError, queryError],
  );

  const hasData = qualificationTypes.length > 0;
  const isFilterActive =
    state.isActiveFilter !== undefined ||
    state.assessmentFormatFilter !== undefined;
  const isSearchActive = state.search.trim().length > 0;
  const activeFilterCount = [
    state.isActiveFilter,
    state.assessmentFormatFilter,
  ].filter((v) => v !== undefined).length;

  const handleSearchChange = useCallback((value: string) => {
    dispatch({ type: QualificationTypeTabActionType.SetSearch, value });
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      dispatch({ type: QualificationTypeTabActionType.SetDebouncedSearch, value });
    }, 300);
  }, []);

  const handleIsActiveFilterChange = useCallback(
    (value: boolean | undefined) => {
      dispatch({ type: QualificationTypeTabActionType.SetIsActiveFilter, value });
    },
    [],
  );

  const handleAssessmentFormatFilterChange = useCallback(
    (value: typeof state.assessmentFormatFilter) => {
      dispatch({
        type: QualificationTypeTabActionType.SetAssessmentFormatFilter,
        value,
      });
    },
    [],
  );

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: QualificationTypeTabActionType.SetPage, page });
  }, []);

  const handleOpenCreate = useCallback(() => {
    dispatch({ type: QualificationTypeTabActionType.OpenForm, target: null });
  }, []);

  const handleOpenEdit = useCallback((target: PriorQualificationType) => {
    dispatch({ type: QualificationTypeTabActionType.OpenForm, target });
  }, []);

  const handleCloseForm = useCallback(() => {
    dispatch({ type: QualificationTypeTabActionType.CloseForm });
  }, []);

  const handleOpenDelete = useCallback((target: PriorQualificationType) => {
    dispatch({ type: QualificationTypeTabActionType.OpenDelete, target });
  }, []);

  const handleCloseDelete = useCallback(() => {
    dispatch({ type: QualificationTypeTabActionType.CloseDelete });
  }, []);

  const handleOpenView = useCallback((target: PriorQualificationType) => {
    dispatch({ type: QualificationTypeTabActionType.OpenView, target });
  }, []);

  const handleCloseView = useCallback(() => {
    dispatch({ type: QualificationTypeTabActionType.CloseView });
  }, []);

  const handleCloseImportSummary = useCallback(() => {
    dispatch({ type: QualificationTypeTabActionType.CloseImportSummary });
  }, []);

  const clearAllFilters = useCallback(() => {
    dispatch({
      type: QualificationTypeTabActionType.SetIsActiveFilter,
      value: undefined,
    });
    dispatch({
      type: QualificationTypeTabActionType.SetAssessmentFormatFilter,
      value: undefined,
    });
    dispatch({ type: QualificationTypeTabActionType.SetSearch, value: "" });
    dispatch({ type: QualificationTypeTabActionType.SetDebouncedSearch, value: "" });
  }, []);

  const handleImportDefaults = useCallback(() => {
    Modal.confirm({
      title: "Import standard qualification types?",
      content:
        "Import 8 standard qualification types? Existing codes will be skipped.",
      okText: "Import defaults",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const result = await importPriorQualificationTypeDefaults(async (body) => {
            await createType(body).unwrap();
          });
          dispatch({
            type: QualificationTypeTabActionType.OpenImportSummary,
            result,
          });
        } catch (err: unknown) {
          handleApiError(err, {
            context: { screen: RequestScreen.Action, method: "POST" },
          });
        }
      },
    });
  }, [createType, handleApiError]);

  return {
    state: {
      qualificationTypes,
      totalItems,
      isLoading,
      isError,
      sectionError,
      search: state.search,
      isActiveFilter: state.isActiveFilter,
      assessmentFormatFilter: state.assessmentFormatFilter,
      page: state.page,
      itemsPerPage: PRIOR_QUALIFICATION_TYPE_LIST_ITEMS_PER_PAGE,
      formTarget: state.formTarget,
      formOpen: state.formOpen,
      deleteTarget: state.deleteTarget,
      viewTarget: state.viewTarget,
      importSummary: state.importSummary,
      importSummaryOpen: state.importSummaryOpen,
      isImporting,
    },
    actions: {
      handleSearchChange,
      handleIsActiveFilterChange,
      handleAssessmentFormatFilterChange,
      handlePageChange,
      handleOpenCreate,
      handleOpenEdit,
      handleCloseForm,
      handleOpenDelete,
      handleCloseDelete,
      handleOpenView,
      handleCloseView,
      handleImportDefaults,
      handleCloseImportSummary,
      clearAllFilters,
      refetch,
    },
    flags: {
      hasData,
      isFilterActive,
      isSearchActive,
      activeFilterCount,
      canEdit,
      canDelete,
    },
  };
}
