import {
  PROGRAM_ADMISSION_CONFIG_INCLUDE,
  PROGRAM_ADMISSION_CONFIG_ITEMS_PER_PAGE,
  PROGRAM_ADMISSION_CONFIG_SORT,
} from "@/shared/constants/programAdmissionConfigOptions";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
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
import { computeQuotaSeats } from "../utils/seatMath";

const DEBOUNCE_MS = 300;

function matchesQuotaFilter(
  config: ProgramAdmissionConfig,
  quotaFilter: QuotaFilterValue | undefined,
): boolean {
  if (!quotaFilter) return true;
  const seats = computeQuotaSeats(config);

  if (quotaFilter === "ANY_FULL") {
    return (
      seats.meritAvailable === 0 ||
      seats.catchmentAvailable === 0 ||
      seats.eldsAvailable === 0
    );
  }

  if (quotaFilter === "ALL_OPEN") {
    return (
      seats.meritAvailable > 0 &&
      seats.catchmentAvailable > 0 &&
      seats.eldsAvailable > 0
    );
  }

  return (
    Number(config.meritCutoff) === 0 ||
    Number(config.catchmentCutoff) === 0 ||
    Number(config.eldsCutoff) === 0
  );
}

export function useProgramAdmissionConfigTab() {
  const [state, dispatch] = useReducer(
    programAdmissionConfigTabReducer,
    initialProgramAdmissionConfigTabState,
  );

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const { data, isLoading, isError, refetch } = useGetProgramAdmissionConfigsQuery({
    itemsPerPage: PROGRAM_ADMISSION_CONFIG_ITEMS_PER_PAGE,
    include: PROGRAM_ADMISSION_CONFIG_INCLUDE,
    sort: PROGRAM_ADMISSION_CONFIG_SORT,
  });

  const { data: programsData, isLoading: isProgramsLoading } = useGetProgramsQuery({
    itemsPerPage: 100,
    sort: "name:asc",
    include: "department",
  });

  const configs = data?.member ?? [];
  const programs = programsData?.member ?? [];

  const filteredConfigs = useMemo(() => {
    const searchValue = state.debouncedSearch.trim().toLowerCase();
    return configs.filter((config) => {
      if (state.programFilter !== undefined && config.programId !== state.programFilter) {
        return false;
      }

      if (!matchesQuotaFilter(config, state.quotaFilter)) {
        return false;
      }

      if (!searchValue) return true;
      const programName = config.program?.name?.toLowerCase() ?? "";
      const departmentName = config.program?.department?.name?.toLowerCase() ?? "";
      return (
        programName.includes(searchValue) || departmentName.includes(searchValue)
      );
    });
  }, [configs, state.debouncedSearch, state.programFilter, state.quotaFilter]);

  const configuredProgramIds = useMemo(
    () => new Set(configs.map((config) => config.programId)),
    [configs],
  );

  const missingProgramCount = useMemo(
    () => programs.filter((program) => !configuredProgramIds.has(program.id)).length,
    [programs, configuredProgramIds],
  );

  const totalCapacity = useMemo(
    () =>
      filteredConfigs.reduce((sum, config) => sum + config.totalCapacity, 0),
    [filteredConfigs],
  );

  const fullQuotaProgramCount = useMemo(
    () =>
      filteredConfigs.filter((config) => {
        const seats = computeQuotaSeats(config);
        return (
          seats.meritAvailable === 0 ||
          seats.catchmentAvailable === 0 ||
          seats.eldsAvailable === 0
        );
      }).length,
    [filteredConfigs],
  );

  const handleSearchChange = useCallback((value: string) => {
    dispatch({ type: ProgramAdmissionConfigTabActionType.SetSearch, value });
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      dispatch({
        type: ProgramAdmissionConfigTabActionType.SetDebouncedSearch,
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

  const handleClearFilters = useCallback(() => {
    dispatch({
      type: ProgramAdmissionConfigTabActionType.SetProgramFilter,
      value: undefined,
    });
    dispatch({
      type: ProgramAdmissionConfigTabActionType.SetQuotaFilter,
      value: undefined,
    });
    dispatch({ type: ProgramAdmissionConfigTabActionType.SetSearch, value: "" });
    dispatch({
      type: ProgramAdmissionConfigTabActionType.SetDebouncedSearch,
      value: "",
    });
  }, []);

  const activeFilterCount = [state.programFilter, state.quotaFilter].filter(
    (value) => value !== undefined,
  ).length;
  const hasData = filteredConfigs.length > 0;
  const isSearchOrFilterActive =
    activeFilterCount > 0 || state.debouncedSearch.trim().length > 0;

  return {
    state: {
      allConfigs: configs,
      configs: filteredConfigs,
      programs,
      configuredProgramCount: configs.length,
      missingProgramCount,
      totalCapacity,
      fullQuotaProgramCount,
      isLoading: isLoading || isProgramsLoading,
      isError,
      search: state.search,
      programFilter: state.programFilter,
      quotaFilter: state.quotaFilter,
      formTarget: state.formTarget,
      formOpen: state.formOpen,
      deleteTarget: state.deleteTarget,
      deleteOpen: state.deleteOpen,
      activeFilterCount,
    },
    actions: {
      handleSearchChange,
      handleProgramFilterChange,
      handleQuotaFilterChange,
      handleOpenCreate,
      handleOpenEdit,
      handleCloseForm,
      handleOpenDelete,
      handleCloseDelete,
      handleClearFilters,
      refetch,
    },
    flags: {
      hasData,
      isSearchOrFilterActive,
    },
  };
}
