import { useGetAdmissionCyclesQuery } from "@/features/admission-config/tabs/admission-cycle/api/admissionCycleApi";
import { useAccessControl } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  ADMISSION_CANDIDATE_ITEMS_PER_PAGE,
  ADMISSION_CANDIDATE_LIST_INCLUDE,
  ADMISSION_CANDIDATE_SORT_DEFAULT,
  CANDIDATE_INGEST_ALLOWED_STATUSES,
} from "@/shared/constants/admissionCandidateOptions";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useGetAdmissionCandidatesQuery } from "../api/admissionCandidateApi";
import {
  admissionCandidatePageReducer,
  AdmissionCandidatePageActionType,
  initialAdmissionCandidatePageState,
} from "../state/admissionCandidatePageState";
import type {
  AdmissionCandidate,
  CandidateEntryMode,
  CandidateGender,
  CreateAdmissionCandidateResponse,
} from "../types/admission-candidate";
import { useAdmissionCandidateBulkUpload } from "./useAdmissionCandidateBulkUpload";

export function useAdmissionCandidatePage() {
  const [state, dispatch] = useReducer(
    admissionCandidatePageReducer,
    {
      ...initialAdmissionCandidatePageState,
      sort: ADMISSION_CANDIDATE_SORT_DEFAULT,
    },
  );

  const { hasPermission } = useAccessControl();

  const firstNameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastNameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const jambRegTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (firstNameTimer.current) clearTimeout(firstNameTimer.current);
      if (lastNameTimer.current) clearTimeout(lastNameTimer.current);
      if (jambRegTimer.current) clearTimeout(jambRegTimer.current);
    };
  }, []);

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
    ...(state.debouncedFirstName
      ? { "search[firstName]": state.debouncedFirstName }
      : {}),
    ...(state.debouncedLastName
      ? { "search[lastName]": state.debouncedLastName }
      : {}),
    ...(state.debouncedJambReg
      ? { "exact[jambRegNo]": state.debouncedJambReg }
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
    if (firstNameTimer.current) clearTimeout(firstNameTimer.current);
    firstNameTimer.current = setTimeout(() => {
      dispatch({
        type: AdmissionCandidatePageActionType.SetDebouncedFirstName,
        value,
      });
    }, 300);
  }, []);

  const handleLastNameSearchChange = useCallback((value: string) => {
    dispatch({
      type: AdmissionCandidatePageActionType.SetLastNameSearch,
      value,
    });
    if (lastNameTimer.current) clearTimeout(lastNameTimer.current);
    lastNameTimer.current = setTimeout(() => {
      dispatch({
        type: AdmissionCandidatePageActionType.SetDebouncedLastName,
        value,
      });
    }, 300);
  }, []);

  const handleJambRegSearchChange = useCallback((value: string) => {
    dispatch({
      type: AdmissionCandidatePageActionType.SetJambRegSearch,
      value,
    });
    if (jambRegTimer.current) clearTimeout(jambRegTimer.current);
    jambRegTimer.current = setTimeout(() => {
      dispatch({
        type: AdmissionCandidatePageActionType.SetDebouncedJambReg,
        value,
      });
    }, 300);
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

  const handleOpenMetadata = useCallback((id: number) => {
    dispatch({
      type: AdmissionCandidatePageActionType.SetMetadataTargetId,
      id,
    });
    dispatch({
      type: AdmissionCandidatePageActionType.SetMetadataModalOpen,
      open: true,
    });
  }, []);

  const handleCloseMetadata = useCallback(() => {
    dispatch({
      type: AdmissionCandidatePageActionType.SetMetadataTargetId,
      id: null,
    });
    dispatch({
      type: AdmissionCandidatePageActionType.SetMetadataModalOpen,
      open: false,
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
      metadataModalOpen: state.metadataModalOpen,
      metadataTargetId: state.metadataTargetId,
      drawerCandidateId: state.drawerCandidateId,
      bulkUploadModalOpen: state.bulkUploadModalOpen,
      offerTarget,
      matriculateTarget,
      offerModalOpen: state.offerTargetId !== null,
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
      handleOpenMetadata,
      handleCloseMetadata,
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
