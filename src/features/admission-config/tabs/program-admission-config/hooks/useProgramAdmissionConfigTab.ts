import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useSetupStatus } from "@/features/tenant-setup/hooks/useSetupStatus";
import { PROGRAM_ADMISSION_CONFIG_LIST_ITEMS_PER_PAGE } from "@/shared/constants/programAdmissionConfigOptions";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { RequestScreen } from "@/shared/types/error-ui";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useGetProgramAdmissionConfigsQuery } from "../api/programAdmissionConfigApi";
import {
  initialProgramAdmissionConfigTabState,
  programAdmissionConfigTabReducer,
  ProgramAdmissionConfigTabActionType,
} from "../state/programAdmissionConfigTabState";
import type {
  ProgramAdmissionConfig,
  QuotaFilterValue,
} from "../types/program-admission-config";
import { buildListQueryParams } from "../utils/buildListQueryParams";
import { matchesQuotaFilter } from "../utils/quotaFilter";
import { computeQuotaSeats } from "../utils/seatMath";

const DEBOUNCE_MS = 300;

export function useProgramAdmissionConfigTab() {
  const [state, dispatch] = useReducer(
    programAdmissionConfigTabReducer,
    initialProgramAdmissionConfigTabState,
  );

  const programNameDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const departmentNameDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    return () => {
      if (programNameDebounceTimer.current) {
        clearTimeout(programNameDebounceTimer.current);
      }
      if (departmentNameDebounceTimer.current) {
        clearTimeout(departmentNameDebounceTimer.current);
      }
    };
  }, []);

  const queryParams = useMemo(
    () =>
      buildListQueryParams({
        page: state.page,
        debouncedProgramNameSearch: state.debouncedProgramNameSearch,
        debouncedDepartmentNameSearch: state.debouncedDepartmentNameSearch,
        programFilter: state.programFilter,
      }),
    [
      state.page,
      state.debouncedProgramNameSearch,
      state.debouncedDepartmentNameSearch,
      state.programFilter,
    ],
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProgramAdmissionConfigsQuery(queryParams);

  const { data: programsData, isLoading: isProgramsLoading } = useGetProgramsQuery({
    itemsPerPage: 100,
    sort: "name:asc",
    include: "department",
  });

  const { state: setupState } = useSetupStatus();
  const setupProgramCount = setupState.probes.programs;
  const setupConfigCount = setupState.probes.admissionConfigs;
  const isSetupStatusLoading = setupState.isLoading;

  const pageConfigs = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;
  const programs = programsData?.member ?? [];

  const configs = useMemo(
    () => pageConfigs.filter((config) => matchesQuotaFilter(config, state.quotaFilter)),
    [pageConfigs, state.quotaFilter],
  );

  const configuredProgramCount = setupConfigCount ?? 0;
  const totalProgramCount = setupProgramCount ?? 0;
  const missingProgramCount = Math.max(0, totalProgramCount - configuredProgramCount);

  const totalCapacity = useMemo(
    () => configs.reduce((sum, config) => sum + config.totalCapacity, 0),
    [configs],
  );

  const fullQuotaProgramCount = useMemo(
    () =>
      configs.filter((config) => {
        const seats = computeQuotaSeats(config);
        return (
          seats.meritAvailable === 0 ||
          seats.catchmentAvailable === 0 ||
          seats.eldsAvailable === 0
        );
      }).length,
    [configs],
  );

  const sectionErrorMessage = useMemo(
    () =>
      deriveSectionErrorMessage(isError, error, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isError, error],
  );

  const handleProgramNameSearchChange = useCallback((value: string) => {
    dispatch({
      type: ProgramAdmissionConfigTabActionType.SetProgramNameSearch,
      value,
    });
    if (programNameDebounceTimer.current) {
      clearTimeout(programNameDebounceTimer.current);
    }
    programNameDebounceTimer.current = setTimeout(() => {
      dispatch({
        type: ProgramAdmissionConfigTabActionType.SetDebouncedProgramNameSearch,
        value,
      });
    }, DEBOUNCE_MS);
  }, []);

  const handleDepartmentNameSearchChange = useCallback((value: string) => {
    dispatch({
      type: ProgramAdmissionConfigTabActionType.SetDepartmentNameSearch,
      value,
    });
    if (departmentNameDebounceTimer.current) {
      clearTimeout(departmentNameDebounceTimer.current);
    }
    departmentNameDebounceTimer.current = setTimeout(() => {
      dispatch({
        type: ProgramAdmissionConfigTabActionType.SetDebouncedDepartmentNameSearch,
        value,
      });
    }, DEBOUNCE_MS);
  }, []);

  const handleProgramFilterChange = useCallback((value: number | undefined) => {
    dispatch({
      type: ProgramAdmissionConfigTabActionType.SetProgramFilter,
      value,
    });
  }, []);

  const handleQuotaFilterChange = useCallback(
    (value: QuotaFilterValue | undefined) => {
      dispatch({
        type: ProgramAdmissionConfigTabActionType.SetQuotaFilter,
        value,
      });
    },
    [],
  );

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: ProgramAdmissionConfigTabActionType.SetPage, page });
  }, []);

  const handleOpenCreate = useCallback(() => {
    dispatch({ type: ProgramAdmissionConfigTabActionType.OpenForm, target: null });
  }, []);

  const handleOpenEdit = useCallback((target: ProgramAdmissionConfig) => {
    dispatch({ type: ProgramAdmissionConfigTabActionType.OpenForm, target });
  }, []);

  const handleCloseForm = useCallback(() => {
    dispatch({ type: ProgramAdmissionConfigTabActionType.CloseForm });
  }, []);

  const handleOpenDelete = useCallback((target: ProgramAdmissionConfig) => {
    dispatch({ type: ProgramAdmissionConfigTabActionType.OpenDelete, target });
  }, []);

  const handleCloseDelete = useCallback(() => {
    dispatch({ type: ProgramAdmissionConfigTabActionType.CloseDelete });
  }, []);

  const handleOpenDrawer = useCallback((target: ProgramAdmissionConfig) => {
    dispatch({ type: ProgramAdmissionConfigTabActionType.OpenDrawer, target });
  }, []);

  const handleCloseDrawer = useCallback(() => {
    dispatch({ type: ProgramAdmissionConfigTabActionType.CloseDrawer });
  }, []);

  const handleClearFilters = useCallback(() => {
    dispatch({
      type: ProgramAdmissionConfigTabActionType.SetProgramFilter,
      value: undefined,
    });
    dispatch({
      type: ProgramAdmissionConfigTabActionType.SetQuotaFilter,
      value: undefined,
    });
    dispatch({
      type: ProgramAdmissionConfigTabActionType.SetProgramNameSearch,
      value: "",
    });
    dispatch({
      type: ProgramAdmissionConfigTabActionType.SetDebouncedProgramNameSearch,
      value: "",
    });
    dispatch({
      type: ProgramAdmissionConfigTabActionType.SetDepartmentNameSearch,
      value: "",
    });
    dispatch({
      type: ProgramAdmissionConfigTabActionType.SetDebouncedDepartmentNameSearch,
      value: "",
    });
  }, []);

  const activeFilterCount = [state.programFilter, state.quotaFilter].filter(
    (value) => value !== undefined,
  ).length;
  const hasData = configs.length > 0;
  const isSearchOrFilterActive =
    activeFilterCount > 0 ||
    state.debouncedProgramNameSearch.trim().length > 0 ||
    state.debouncedDepartmentNameSearch.trim().length > 0;
  const isQuotaHealthFilterActive = state.quotaFilter !== undefined;

  return {
    state: {
      configs,
      programs,
      configuredProgramCount,
      missingProgramCount,
      totalCapacity,
      fullQuotaProgramCount,
      isLoading:
        isLoading || isProgramsLoading || isSetupStatusLoading,
      isError,
      sectionErrorMessage,
      programNameSearch: state.programNameSearch,
      departmentNameSearch: state.departmentNameSearch,
      programFilter: state.programFilter,
      quotaFilter: state.quotaFilter,
      page: state.page,
      itemsPerPage: PROGRAM_ADMISSION_CONFIG_LIST_ITEMS_PER_PAGE,
      totalItems,
      formTarget: state.formTarget,
      formOpen: state.formOpen,
      deleteTarget: state.deleteTarget,
      deleteOpen: state.deleteOpen,
      drawerTarget: state.drawerTarget,
      drawerOpen: state.drawerOpen,
      activeFilterCount,
      isQuotaHealthFilterActive,
    },
    actions: {
      handleProgramNameSearchChange,
      handleDepartmentNameSearchChange,
      handleProgramFilterChange,
      handleQuotaFilterChange,
      handlePageChange,
      handleOpenCreate,
      handleOpenEdit,
      handleCloseForm,
      handleOpenDelete,
      handleCloseDelete,
      handleOpenDrawer,
      handleCloseDrawer,
      handleClearFilters,
      refetch,
    },
    flags: {
      hasData,
      isSearchOrFilterActive,
    },
  };
}
