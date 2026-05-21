import {
  PROGRAM_OLEVEL_LIST_ITEMS_PER_PAGE,
  PROGRAM_OLEVEL_REQUIREMENT_INCLUDE,
  PROGRAM_OLEVEL_REQUIREMENT_SORT_DEFAULT,
} from "@/shared/constants/programOlevelRuleOptions";
import { useGetDepartmentsQuery } from "@/features/academic-structure/api/departmentsApi";
import { useGetFacultiesQuery } from "@/features/academic-structure/api/facultiesApi";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useGetProgramOlevelRequirementsQuery } from "../api/programOlevelRuleApi";
import {
  initialProgramOlevelRuleTabState,
  programOlevelRuleTabReducer,
  ProgramOlevelRuleTabActionType,
} from "../state/programOlevelRuleTabState";
import type {
  ProgramOlevelRequirement,
  ProgramOlevelRuleGroup,
} from "../types/program-olevel-rule";
import {
  filterRuleGroups,
  groupRequirementsByProgram,
  programsMissingOlevelRules,
} from "../utils/groupRequirementsByProgram";

const DEBOUNCE_MS = 300;
const CARD_PAGE_SIZE = 10;

export function useProgramOlevelRuleTab() {
  const [state, dispatch] = useReducer(
    programOlevelRuleTabReducer,
    initialProgramOlevelRuleTabState,
  );

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const listParams = {
    itemsPerPage: PROGRAM_OLEVEL_LIST_ITEMS_PER_PAGE,
    sort: PROGRAM_OLEVEL_REQUIREMENT_SORT_DEFAULT,
    include: PROGRAM_OLEVEL_REQUIREMENT_INCLUDE,
  };

  const {
    data: requirementsData,
    isLoading: isRequirementsLoading,
    isError: isRequirementsError,
    refetch,
  } = useGetProgramOlevelRequirementsQuery(listParams);

  const { data: programsData, isLoading: isProgramsLoading } = useGetProgramsQuery(
    {
      itemsPerPage: 100,
      sort: "name:asc",
    },
  );

  const { data: facultiesData } = useGetFacultiesQuery({
    itemsPerPage: 100,
    sort: "name:asc",
  });

  const { data: departmentsData } = useGetDepartmentsQuery({
    itemsPerPage: 100,
    sort: "name:asc",
    ...(state.facultyFilter !== undefined
      ? { "exact[facultyId]": state.facultyFilter }
      : {}),
  });

  const allGroups = useMemo(
    () => groupRequirementsByProgram(requirementsData?.member ?? []),
    [requirementsData?.member],
  );

  const filteredGroups = useMemo(
    () =>
      filterRuleGroups(allGroups, {
        search: state.debouncedSearch,
        facultyId: state.facultyFilter,
        departmentId: state.departmentFilter,
      }),
    [
      allGroups,
      state.debouncedSearch,
      state.facultyFilter,
      state.departmentFilter,
    ],
  );

  const totalFiltered = filteredGroups.length;
  const pageStart = (state.page - 1) * CARD_PAGE_SIZE;
  const groups = filteredGroups.slice(pageStart, pageStart + CARD_PAGE_SIZE);

  const configuredProgramIds = useMemo(
    () => new Set(allGroups.map((g) => g.programId)),
    [allGroups],
  );

  const programs = programsData?.member ?? [];
  const missingPrograms = useMemo(
    () => programsMissingOlevelRules(programs, configuredProgramIds),
    [programs, configuredProgramIds],
  );

  const faculties = facultiesData?.member ?? [];
  const departments = departmentsData?.member ?? [];

  const handleSearchChange = useCallback((value: string) => {
    dispatch({ type: ProgramOlevelRuleTabActionType.SetSearch, value });
    dispatch({ type: ProgramOlevelRuleTabActionType.SetPage, value: 1 });

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      dispatch({
        type: ProgramOlevelRuleTabActionType.SetDebouncedSearch,
        value,
      });
    }, DEBOUNCE_MS);
  }, []);

  const handleFacultyFilterChange = useCallback((value: number | undefined) => {
    dispatch({
      type: ProgramOlevelRuleTabActionType.SetFacultyFilter,
      value,
    });
  }, []);

  const handleDepartmentFilterChange = useCallback(
    (value: number | undefined) => {
      dispatch({
        type: ProgramOlevelRuleTabActionType.SetDepartmentFilter,
        value,
      });
    },
    [],
  );

  const handleClearFilters = useCallback(() => {
    dispatch({
      type: ProgramOlevelRuleTabActionType.SetFacultyFilter,
      value: undefined,
    });
    dispatch({
      type: ProgramOlevelRuleTabActionType.SetDepartmentFilter,
      value: undefined,
    });
    dispatch({ type: ProgramOlevelRuleTabActionType.SetSearch, value: "" });
    dispatch({
      type: ProgramOlevelRuleTabActionType.SetDebouncedSearch,
      value: "",
    });
    dispatch({ type: ProgramOlevelRuleTabActionType.SetPage, value: 1 });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: ProgramOlevelRuleTabActionType.SetPage, value: page });
  }, []);

  const handleOpenCreate = useCallback(() => {
    dispatch({
      type: ProgramOlevelRuleTabActionType.OpenForm,
      target: null,
    });
  }, []);

  const handleOpenAddSubject = useCallback((group: ProgramOlevelRuleGroup) => {
    dispatch({
      type: ProgramOlevelRuleTabActionType.OpenForm,
      target: null,
      presetProgramId: group.programId,
    });
  }, []);

  const handleOpenEditRequirement = useCallback(
    (requirement: ProgramOlevelRequirement) => {
      dispatch({
        type: ProgramOlevelRuleTabActionType.OpenForm,
        target: requirement,
      });
    },
    [],
  );

  const getSubjectIdsForProgram = useCallback(
    (programId: number): number[] => {
      const group = allGroups.find((g) => g.programId === programId);
      return group?.requirements.map((r) => r.subjectId) ?? [];
    },
    [allGroups],
  );

  const handleCloseForm = useCallback(() => {
    dispatch({ type: ProgramOlevelRuleTabActionType.CloseForm });
  }, []);

  const handleOpenDeleteRequirement = useCallback(
    (requirement: ProgramOlevelRequirement) => {
      dispatch({
        type: ProgramOlevelRuleTabActionType.OpenDelete,
        target: requirement,
      });
    },
    [],
  );

  const handleCloseDelete = useCallback(() => {
    dispatch({ type: ProgramOlevelRuleTabActionType.CloseDelete });
  }, []);

  const activeFilterCount = [
    state.facultyFilter,
    state.departmentFilter,
  ].filter((v) => v !== undefined).length;

  const isSearchOrFilterActive =
    state.debouncedSearch.trim().length > 0 || activeFilterCount > 0;

  const isLoading = isRequirementsLoading || isProgramsLoading;
  const isError = isRequirementsError;
  const hasData = filteredGroups.length > 0;

  return {
    state: {
      groups,
      allGroups,
      filteredGroups,
      totalFiltered,
      totalRequirements: requirementsData?.totalItems ?? 0,
      configuredProgramCount: allGroups.length,
      missingProgramsCount: missingPrograms.length,
      programs,
      faculties,
      departments,
      configuredProgramIds,
      isLoading,
      isError,
      search: state.search,
      facultyFilter: state.facultyFilter,
      departmentFilter: state.departmentFilter,
      page: state.page,
      formTarget: state.formTarget,
      formPresetProgramId: state.formPresetProgramId,
      formOpen: state.formOpen,
      deleteTarget: state.deleteTarget,
      deleteOpen: state.deleteOpen,
      activeFilterCount,
    },
    actions: {
      handleSearchChange,
      handleFacultyFilterChange,
      handleDepartmentFilterChange,
      handleClearFilters,
      handlePageChange,
      handleOpenCreate,
      handleOpenAddSubject,
      handleOpenEditRequirement,
      handleCloseForm,
      handleOpenDeleteRequirement,
      handleCloseDelete,
      getSubjectIdsForProgram,
      refetch,
    },
    flags: {
      hasData,
      isSearchOrFilterActive,
    },
  };
}
