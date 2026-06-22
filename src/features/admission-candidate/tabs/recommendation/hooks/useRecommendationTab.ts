import type { AppStore } from "@/app/store";
import { useAccessControl } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useGetAdmissionCyclesQuery } from "@/features/admission-config/tabs/admission-cycle/api/admissionCycleApi";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import {
    RECOMMENDATION_ITEMS_PER_PAGE,
    RECOMMENDATION_LIST_INCLUDE,
    RECOMMENDATION_SORT_DEFAULT,
} from "@/shared/constants/admissionRecommendedCandidateOptions";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useCallback, useMemo, useReducer, useState } from "react";
import { useStore } from "react-redux";
import { useGetRecommendedCandidatesQuery, downloadRecommendedCandidates } from "../api/admissionRecommendedCandidateApi";
import {
    RecommendationPageActionType,
    initialRecommendationPageState,
    recommendationPageReducer,
} from "../state/recommendationPageState";
import type {
    AdmissionRecommendedCandidate,
    QuotaCategory,
    RecommendedCandidateListParams,
} from "../types/admission-recommended-candidate";

export function useRecommendationTab() {
  const [state, dispatch] = useReducer(recommendationPageReducer, {
    ...initialRecommendationPageState,
    sort: RECOMMENDATION_SORT_DEFAULT,
  });

  const { hasPermission } = useAccessControl();
  const store = useStore() as AppStore;
  const handleApiError = useApiError();
  const [isDownloading, setIsDownloading] = useState(false);

  // ─── Dropdown data ────────────────────────────────────────────────────────
  const { data: cyclesData } = useGetAdmissionCyclesQuery({
    itemsPerPage: 100,
    sort: "createdAt:desc",
  });
  const cycles = cyclesData?.member ?? [];

  const { data: programsData } = useGetProgramsQuery(
    { itemsPerPage: 200, sort: "name:asc", include: "department" },
    { skip: state.cycleId === undefined },
  );
  const programs = programsData?.member ?? [];

  // ─── List query ───────────────────────────────────────────────────────────
  const skipList = state.cycleId === undefined;

  const queryParams: RecommendedCandidateListParams = {
    page: state.page,
    itemsPerPage: RECOMMENDATION_ITEMS_PER_PAGE,
    sort: state.sort,
    include: RECOMMENDATION_LIST_INCLUDE,
    "exact[cycleId]": state.cycleId!,
    ...(state.programId !== undefined
      ? { "exact[appliedProgramId]": state.programId }
      : {}),
    ...(state.quotaFilter !== undefined
      ? { "exact[quotaCategory]": state.quotaFilter }
      : {}),
  };

  const {
    data,
    isLoading,
    isError,
    error: queryError,
    refetch,
  } = useGetRecommendedCandidatesQuery(queryParams, { skip: skipList });

  const rows = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isError, queryError, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isError, queryError],
  );

  // ─── Derived ──────────────────────────────────────────────────────────────
  const isFilterActive =
    state.programId !== undefined || state.quotaFilter !== undefined;

  const hasData = rows.length > 0;

  const offerTarget = useMemo<AdmissionRecommendedCandidate | null>(
    () => rows.find((r) => r.candidateId === state.offerTargetId) ?? null,
    [rows, state.offerTargetId],
  );

  const drawerTarget = useMemo<AdmissionRecommendedCandidate | null>(
    () => rows.find((r) => r.candidateId === state.drawerCandidateId) ?? null,
    [rows, state.drawerCandidateId],
  );

  const canOffer = hasPermission(Permission.AdmissionCandidatesManage);

  // ─── Actions ──────────────────────────────────────────────────────────────
  const handleCycleChange = useCallback((cycleId: number | undefined) => {
    dispatch({ type: RecommendationPageActionType.SetCycleId, cycleId });
  }, []);

  const handleProgramChange = useCallback((programId: number | undefined) => {
    dispatch({ type: RecommendationPageActionType.SetProgramId, programId });
  }, []);

  const handleQuotaFilterChange = useCallback(
    (value: QuotaCategory | undefined) => {
      dispatch({ type: RecommendationPageActionType.SetQuotaFilter, value });
    },
    [],
  );

  const handleSortChange = useCallback((sort: string) => {
    dispatch({ type: RecommendationPageActionType.SetSort, sort });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: RecommendationPageActionType.SetPage, page });
  }, []);

  const clearAllFilters = useCallback(() => {
    dispatch({
      type: RecommendationPageActionType.SetProgramId,
      programId: undefined,
    });
    dispatch({
      type: RecommendationPageActionType.SetQuotaFilter,
      value: undefined,
    });
  }, []);

  const handleOpenDrawer = useCallback(
    (record: AdmissionRecommendedCandidate) => {
      dispatch({
        type: RecommendationPageActionType.SetDrawerCandidateId,
        id: record.candidateId,
      });
    },
    [],
  );

  const handleCloseDrawer = useCallback(() => {
    dispatch({
      type: RecommendationPageActionType.SetDrawerCandidateId,
      id: null,
    });
  }, []);

  const handleOpenOffer = useCallback(
    (record: AdmissionRecommendedCandidate) => {
      dispatch({
        type: RecommendationPageActionType.SetOfferTargetId,
        id: record.candidateId,
      });
    },
    [],
  );

  const handleCloseOffer = useCallback(() => {
    dispatch({ type: RecommendationPageActionType.SetOfferTargetId, id: null });
  }, []);

  const handleDownload = useCallback(async () => {
    if (state.cycleId === undefined) return;
    setIsDownloading(true);
    try {
      await downloadRecommendedCandidates(store, state.cycleId, state.sort);
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "GET" },
      });
    } finally {
      setIsDownloading(false);
    }
  }, [store, state.cycleId, state.sort, handleApiError]);

  return {
    state: {
      rows,
      totalItems,
      isLoading: skipList ? false : isLoading,
      isError,
      sectionError,
      skipList,
      cycles,
      programs,
      cycleId: state.cycleId,
      programId: state.programId,
      quotaFilter: state.quotaFilter,
      page: state.page,
      itemsPerPage: RECOMMENDATION_ITEMS_PER_PAGE,
      offerTarget,
      offerModalOpen: state.offerTargetId !== null,
      drawerTarget,
      drawerOpen: state.drawerCandidateId !== null,
    },
    actions: {
      handleCycleChange,
      handleProgramChange,
      handleQuotaFilterChange,
      handleSortChange,
      handlePageChange,
      clearAllFilters,
      handleOpenDrawer,
      handleCloseDrawer,
      handleOpenOffer,
      handleCloseOffer,
      handleDownload,
      refetch,
    },
    flags: {
      hasData,
      isFilterActive,
      canOffer,
      isDownloading,
    },
  };
}
