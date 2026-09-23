import { useAccessControl } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useGetAdmissionCyclesQuery } from "@/features/admission-config/tabs/admission-cycle/api/admissionCycleApi";
import {
  ADMISSION_CANDIDATE_ITEMS_PER_PAGE,
  ADMISSION_CANDIDATE_LIST_INCLUDE,
  ADMISSION_CANDIDATE_SORT_DEFAULT,
  CANDIDATE_INGEST_ALLOWED_STATUSES,
} from "@/shared/constants/admissionCandidateOptions";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useCallback, useMemo, useReducer } from "react";
import { useGetAdmissionCandidatesQuery } from "../api/admissionCandidateApi";
import {
  AdmissionCandidatePageActionType,
  admissionCandidatePageReducer,
  initialAdmissionCandidatePageState,
} from "../state/admissionCandidatePageState";
import type {
  AdmissionCandidate,
  CandidateEntryMode,
  CandidateGender,
  CreateAdmissionCandidateResponse,
} from "../types/admission-candidate";
import { useAdmissionCandidateBulkUpload } from "./useAdmissionCandidateBulkUpload";

export function useAdmissionCandidateTab() {
  const [state, dispatch] = useReducer(admissionCandidatePageReducer, {
    ...initialAdmissionCandidatePageState,
    sort: ADMISSION_CANDIDATE_SORT_DEFAULT,
  });

  const { hasPermission } = useAccessControl();

  const debouncedFirstName = useDebouncedValue(state.firstNameSearch, 500);
  const debouncedLastName = useDebouncedValue(state.lastNameSearch, 500);
  const debouncedJambReg = useDebouncedValue(state.jambRegSearch, 500);

  const { data: cyclesData } = useGetAdmissionCyclesQuery({
    itemsPerPage: 100,
    sort: "createdAt:desc",
  });
  const cycles = cyclesData?.member ?? [];

  const selectedCycle = useMemo(
    () => cycles.find((c) => c.id === state.cycleId),
    [cycles, state.cycleId],
  );

  const canIngest = useMemo(() => {
    if (!selectedCycle) return false;
    return (CANDIDATE_INGEST_ALLOWED_STATUSES as readonly string[]).includes(
      selectedCycle.status,
    );
  }, [selectedCycle]);

  const skipList = state.cycleId === undefined;

  const queryParams = {
    page: state.page,
    itemsPerPage: ADMISSION_CANDIDATE_ITEMS_PER_PAGE,
    sort: state.sort,
    include: ADMISSION_CANDIDATE_LIST_INCLUDE,
    "exact[cycleId]": state.cycleId!,
    ...(debouncedFirstName
      ? { "search[firstName]": debouncedFirstName }
      : {}),
    ...(debouncedLastName
      ? { "search[lastName]": debouncedLastName }
      : {}),
    ...(debouncedJambReg
      ? { "exact[jambRegNo]": debouncedJambReg }
      : {}),
    ...(state.genderFilter !== undefined
      ? { "exact[gender]": state.genderFilter }
      : {}),
    ...(state.stateFilter !== undefined
      ? { "exact[stateId]": state.stateFilter }
      : {}),
    ...(state.entryModeFilter !== undefined
      ? { "exact[entryMode]": state.entryModeFilter }
      : {}),
  };

  const { data, isLoading, isError, refetch } = useGetAdmissionCandidatesQuery(
    queryParams,
    { skip: skipList },
  );

  const candidates = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  const handleCloseBulkUpload = useCallback(() => {
    dispatch({
      type: AdmissionCandidatePageActionType.SetBulkUploadModalOpen,
      open: false,
    });
    refetch();
  }, [refetch]);

  const bulkUpload = useAdmissionCandidateBulkUpload({
    cycleId: state.cycleId,
    canIngest,
    onClose: handleCloseBulkUpload,
  });

  const isSearchActive =
    state.firstNameSearch.trim().length > 0 ||
    state.lastNameSearch.trim().length > 0 ||
    state.jambRegSearch.trim().length > 0;

  const isFilterActive =
    state.genderFilter !== undefined ||
    state.stateFilter !== undefined ||
    state.entryModeFilter !== undefined;

  const hasData = candidates.length > 0;

  const offerTarget = useMemo(
    () => candidates.find((c) => c.id === state.offerTargetId) ?? null,
    [candidates, state.offerTargetId],
  );

  const matriculateTarget = useMemo(
    () => candidates.find((c) => c.id === state.matriculateTargetId) ?? null,
    [candidates, state.matriculateTargetId],
  );

  const canCreate = hasPermission(Permission.AdmissionCandidatesCreate);
  const canUpdate = hasPermission(Permission.AdmissionCandidatesUpdate);
  const canManage = hasPermission(Permission.AdmissionCandidatesManage);

  const handleCycleChange = useCallback((cycleId: number | undefined) => {
    dispatch({
      type: AdmissionCandidatePageActionType.SetCycleId,
      cycleId,
    });
  }, []);

  const handleFirstNameSearchChange = useCallback((value: string) => {
    dispatch({
      type: AdmissionCandidatePageActionType.SetFirstNameSearch,
      value,
    });
  }, []);

  const handleLastNameSearchChange = useCallback((value: string) => {
    dispatch({
      type: AdmissionCandidatePageActionType.SetLastNameSearch,
      value,
    });
  }, []);

  const handleJambRegSearchChange = useCallback((value: string) => {
    dispatch({
      type: AdmissionCandidatePageActionType.SetJambRegSearch,
      value,
    });
  }, []);

  const handleGenderFilterChange = useCallback(
    (value: CandidateGender | undefined) => {
      dispatch({
        type: AdmissionCandidatePageActionType.SetGenderFilter,
        value,
      });
    },
    [],
  );

  const handleStateFilterChange = useCallback((value: number | undefined) => {
    dispatch({
      type: AdmissionCandidatePageActionType.SetStateFilter,
      value,
    });
  }, []);

  const handleEntryModeFilterChange = useCallback(
    (value: CandidateEntryMode | undefined) => {
      dispatch({
        type: AdmissionCandidatePageActionType.SetEntryModeFilter,
        value,
      });
    },
    [],
  );

  const handleSortChange = useCallback((sort: string) => {
    dispatch({ type: AdmissionCandidatePageActionType.SetSort, sort });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: AdmissionCandidatePageActionType.SetPage, page });
  }, []);

  const handleOpenCreate = useCallback(() => {
    dispatch({
      type: AdmissionCandidatePageActionType.SetFormModalOpen,
      open: true,
    });
  }, []);

  const handleCloseForm = useCallback(() => {
    dispatch({
      type: AdmissionCandidatePageActionType.SetFormModalOpen,
      open: false,
    });
  }, []);

  const handleCandidateCreated = useCallback(
    (result: CreateAdmissionCandidateResponse) => {
      dispatch({
        type: AdmissionCandidatePageActionType.SetFormModalOpen,
        open: false,
      });
      dispatch({
        type: AdmissionCandidatePageActionType.SetDrawerCandidateId,
        id: result.candidate.id,
      });
    },
    [],
  );

  const handleOpenDrawer = useCallback((id: number) => {
    dispatch({
      type: AdmissionCandidatePageActionType.SetDrawerCandidateId,
      id,
    });
  }, []);

  const handleCloseDrawer = useCallback(() => {
    dispatch({
      type: AdmissionCandidatePageActionType.SetDrawerCandidateId,
      id: null,
    });
  }, []);

  const handleOpenBulkUpload = useCallback(() => {
    dispatch({
      type: AdmissionCandidatePageActionType.SetBulkUploadModalOpen,
      open: true,
    });
  }, []);

  const handleCloseBulkUploadModal = useCallback(() => {
    dispatch({
      type: AdmissionCandidatePageActionType.SetBulkUploadModalOpen,
      open: false,
    });
  }, []);

  const handleOpenOffer = useCallback((id: number) => {
    dispatch({
      type: AdmissionCandidatePageActionType.SetOfferTargetId,
      id,
    });
  }, []);

  const handleCloseOffer = useCallback(() => {
    dispatch({
      type: AdmissionCandidatePageActionType.SetOfferTargetId,
      id: null,
    });
  }, []);

  const handleOpenMatriculate = useCallback((id: number) => {
    dispatch({
      type: AdmissionCandidatePageActionType.SetMatriculateTargetId,
      id,
    });
  }, []);

  const handleCloseMatriculate = useCallback(() => {
    dispatch({
      type: AdmissionCandidatePageActionType.SetMatriculateTargetId,
      id: null,
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    handleGenderFilterChange(undefined);
    handleStateFilterChange(undefined);
    handleEntryModeFilterChange(undefined);
  }, [
    handleGenderFilterChange,
    handleStateFilterChange,
    handleEntryModeFilterChange,
  ]);

  const canOfferCandidate = useCallback(
    (candidate: AdmissionCandidate) =>
      candidate.application !== undefined &&
      candidate.application !== null &&
      candidate.application.finalDecision !== "OFFER_ADMISSION" &&
      !candidate.application.isMatriculated,
    [],
  );

  const canMatriculateCandidate = useCallback(
    (candidate: AdmissionCandidate) =>
      candidate.application?.finalDecision === "OFFER_ADMISSION" &&
      !candidate.application?.isMatriculated,
    [],
  );

  return {
    state: {
      candidates,
      totalItems,
      isLoading: skipList ? false : isLoading,
      isError,
      skipList,
      cycles,
      selectedCycle,
      cycleId: state.cycleId,
      firstNameSearch: state.firstNameSearch,
      lastNameSearch: state.lastNameSearch,
      jambRegSearch: state.jambRegSearch,
      genderFilter: state.genderFilter,
      stateFilter: state.stateFilter,
      entryModeFilter: state.entryModeFilter,
      page: state.page,
      itemsPerPage: ADMISSION_CANDIDATE_ITEMS_PER_PAGE,
      formModalOpen: state.formModalOpen,
      drawerCandidateId: state.drawerCandidateId,
      bulkUploadModalOpen: state.bulkUploadModalOpen,
      offerTarget,
      matriculateTarget,
      offerModalOpen: state.offerTargetId !== null && offerTarget !== null,
      matriculateModalOpen: state.matriculateTargetId !== null,
      canIngest,
    },
    actions: {
      handleCycleChange,
      handleFirstNameSearchChange,
      handleLastNameSearchChange,
      handleJambRegSearchChange,
      handleGenderFilterChange,
      handleStateFilterChange,
      handleEntryModeFilterChange,
      handleSortChange,
      handlePageChange,
      handleOpenCreate,
      handleCloseForm,
      handleCandidateCreated,
      handleOpenDrawer,
      handleCloseDrawer,
      handleOpenBulkUpload,
      handleCloseBulkUploadModal,
      handleOpenOffer,
      handleCloseOffer,
      handleOpenMatriculate,
      handleCloseMatriculate,
      clearAllFilters,
      refetch,
    },
    flags: {
      hasData,
      isSearchActive,
      isFilterActive,
      canCreate,
      canUpdate,
      canManage,
      canOfferCandidate,
      canMatriculateCandidate,
    },
    bulkUpload,
  };
}
