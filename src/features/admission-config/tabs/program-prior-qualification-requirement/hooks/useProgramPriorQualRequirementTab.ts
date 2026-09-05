import { useAccessControl } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useGetDepartmentsQuery } from "@/features/academic-structure/api/departmentsApi";
import { useGetFacultiesQuery } from "@/features/academic-structure/api/facultiesApi";
import { useGetPriorQualificationTypesQuery } from "@/features/admission-config/tabs/qualification-type/api/priorQualificationTypeApi";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import {
  PROGRAM_PRIOR_QUAL_REQUIREMENT_INCLUDE,
  PROGRAM_PRIOR_QUAL_REQUIREMENT_LIST_ITEMS_PER_PAGE,
  PROGRAM_PRIOR_QUAL_REQUIREMENT_SORT_DEFAULT,
} from "@/shared/constants/programPriorQualRequirementOptions";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useGetProgramPriorQualificationRequirementsQuery } from "../api/programPriorQualificationRequirementApi";
import {
  initialProgramPriorQualRequirementTabState,
  programPriorQualRequirementTabReducer,
  ProgramPriorQualRequirementTabActionType,
} from "../state/programPriorQualRequirementTabState";
import type {
  ProgramPriorQualificationRequirement,
  ProgramPriorQualRequirementGroup,
} from "../types/program-prior-qualification-requirement";
import {
  filterRequirementGroups,
  getTypeIdsForProgram,
  groupRequirementsByProgram,
  programsMissingPriorQualRequirements,
} from "../utils/groupRequirementsByProgram";

const DEBOUNCE_MS = 300;
const CARD_PAGE_SIZE = 10;

export function useProgramPriorQualRequirementTab() {
  const [state, dispatch] = useReducer(
    programPriorQualRequirementTabReducer,
    initialProgramPriorQualRequirementTabState,
  );

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { hasPermission } = useAccessControl();

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const listParams = {
    itemsPerPage: PROGRAM_PRIOR_QUAL_REQUIREMENT_LIST_ITEMS_PER_PAGE,
    sort: PROGRAM_PRIOR_QUAL_REQUIREMENT_SORT_DEFAULT,
    include: PROGRAM_PRIOR_QUAL_REQUIREMENT_INCLUDE,
  };

  const {
    data: requirementsData,
    isLoading: isRequirementsLoading,
    isError: isRequirementsError,
    error: requirementsError,
    refetch,
  } = useGetProgramPriorQualificationRequirementsQuery(listParams);

  const { data: programsData, isLoading: isProgramsLoading } = useGetProgramsQuery({
    itemsPerPage: 100,
    sort: "name:asc",
    include: "department",
  });

  const { data: typesData } = useGetPriorQualificationTypesQuery({
    itemsPerPage: 100,
    sort: "code:asc",
    "exact[isActive]": true,
  });

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
      filterRequirementGroups(allGroups, {
        search: state.debouncedSearch,
        facultyId: state.facultyFilter,
        departmentId: state.departmentFilter,
        programId: state.programFilter,
        isMandatory: state.mandatoryFilter,
      }),
    [
      allGroups,
      state.debouncedSearch,
      state.facultyFilter,
      state.departmentFilter,
      state.programFilter,
      state.mandatoryFilter,
    ],
  );

  const totalFiltered = filteredGroups.length;
  const pageStart = (state.page - 1) * CARD_PAGE_SIZE;
  const groups = filteredGroups.slice(pageStart, pageStart + CARD_PAGE_SIZE);

  const configuredProgramIds = useMemo(
    () => new Set(allGroups.map((group) => group.programId)),
    [allGroups],
  );

  const programs = programsData?.member ?? [];
  const qualificationTypes = typesData?.member ?? [];
  const faculties = facultiesData?.member ?? [];
  const departments = departmentsData?.member ?? [];

  const missingPrograms = useMemo(
    () => programsMissingPriorQualRequirements(programs, configuredProgramIds),
    [programs, configuredProgramIds],
  );

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isRequirementsError, requirementsError, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isRequirementsError, requirementsError],
  );

  const handleSearchChange = useCallback((value: string) => {
    dispatch({ type: ProgramPriorQualRequirementTabActionType.SetSearch, value });
    dispatch({ type: ProgramPriorQualRequirementTabActionType.SetPage, value: 1 });
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      dispatch({
        type: ProgramPriorQualRequirementTabActionType.SetDebouncedSearch,
        value,
      });
    }, DEBOUNCE_MS);
  }, []);

  const handleFacultyFilterChange = useCallback((value: number | undefined) => {
    dispatch({
      type: ProgramPriorQualRequirementTabActionType.SetFacultyFilter,
      value,
    });
  }, []);

  const handleDepartmentFilterChange = useCallback((value: number | undefined) => {
    dispatch({
      type: ProgramPriorQualRequirementTabActionType.SetDepartmentFilter,
      value,
    });
  }, []);

  const handleProgramFilterChange = useCallback((value: number | undefined) => {
    dispatch({
      type: ProgramPriorQualRequirementTabActionType.SetProgramFilter,
      value,
    });
  }, []);

  const handleMandatoryFilterChange = useCallback((value: boolean | undefined) => {
    dispatch({
      type: ProgramPriorQualRequirementTabActionType.SetMandatoryFilter,
      value,
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    dispatch({
      type: ProgramPriorQualRequirementTabActionType.SetFacultyFilter,
      value: undefined,
    });
    dispatch({
      type: ProgramPriorQualRequirementTabActionType.SetDepartmentFilter,
      value: undefined,
    });
    dispatch({
      type: ProgramPriorQualRequirementTabActionType.SetProgramFilter,
      value: undefined,
    });
    dispatch({
      type: ProgramPriorQualRequirementTabActionType.SetMandatoryFilter,
      value: undefined,
    });
    dispatch({ type: ProgramPriorQualRequirementTabActionType.SetSearch, value: "" });
    dispatch({
      type: ProgramPriorQualRequirementTabActionType.SetDebouncedSearch,
      value: "",
    });
    dispatch({ type: ProgramPriorQualRequirementTabActionType.SetPage, value: 1 });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: ProgramPriorQualRequirementTabActionType.SetPage, value: page });
  }, []);

  const handleOpenCreate = useCallback(() => {
    dispatch({
      type: ProgramPriorQualRequirementTabActionType.OpenForm,
      target: null,
    });
  }, []);

  const handleOpenAddRequirement = useCallback((group: ProgramPriorQualRequirementGroup) => {
    dispatch({
      type: ProgramPriorQualRequirementTabActionType.OpenForm,
      target: null,
      presetProgramId: group.programId,
    });
  }, []);

  const handleOpenEditRequirement = useCallback(
    (requirement: ProgramPriorQualificationRequirement) => {
      dispatch({
        type: ProgramPriorQualRequirementTabActionType.OpenForm,
        target: requirement,
      });
    },
    [],
  );

  const handleCloseForm = useCallback(() => {
    dispatch({ type: ProgramPriorQualRequirementTabActionType.CloseForm });
  }, []);

  const handleOpenDeleteRequirement = useCallback(
    (requirement: ProgramPriorQualificationRequirement) => {
      dispatch({
        type: ProgramPriorQualRequirementTabActionType.OpenDelete,
        target: requirement,
      });
    },
    [],
  );

  const handleCloseDelete = useCallback(() => {
    dispatch({ type: ProgramPriorQualRequirementTabActionType.CloseDelete });
  }, []);

  const handleOpenViewRequirement = useCallback(
    (requirement: ProgramPriorQualificationRequirement) => {
      dispatch({
        type: ProgramPriorQualRequirementTabActionType.OpenView,
        target: requirement,
      });
    },
    [],
  );

  const handleCloseView = useCallback(() => {
    dispatch({ type: ProgramPriorQualRequirementTabActionType.CloseView });
  }, []);

  const getUsedTypeIdsForProgram = useCallback(
    (programId: number | undefined) => {
      if (programId == null) return [];
      return getTypeIdsForProgram(allGroups, programId);
    },
    [allGroups],
  );

  const activeFilterCount = [
    state.facultyFilter,
    state.departmentFilter,
    state.programFilter,
    state.mandatoryFilter,
  ].filter((value) => value !== undefined).length;

  const isSearchOrFilterActive =
    state.debouncedSearch.trim().length > 0 || activeFilterCount > 0;

  const canEdit = hasPermission(
    Permission.AdmissionProgramPriorQualificationRequirementsUpdate,
  );
  const canDelete = hasPermission(
    Permission.AdmissionProgramPriorQualificationRequirementsDelete,
  );

  return {
    state: {
      groups,
      totalFiltered,
      totalRequirements: requirementsData?.totalItems ?? 0,
      configuredProgramCount: allGroups.length,
      missingProgramsCount: missingPrograms.length,
      programs,
      qualificationTypes,
      faculties,
      departments,
      isLoading: isRequirementsLoading || isProgramsLoading,
      isError: isRequirementsError,
      sectionError,
      search: state.search,
      facultyFilter: state.facultyFilter,
      departmentFilter: state.departmentFilter,
      programFilter: state.programFilter,
      mandatoryFilter: state.mandatoryFilter,
      page: state.page,
      formTarget: state.formTarget,
      formPresetProgramId: state.formPresetProgramId,
      formOpen: state.formOpen,
      deleteTarget: state.deleteTarget,
      deleteOpen: state.deleteOpen,
      viewTarget: state.viewTarget,
      activeFilterCount,
      getUsedTypeIdsForProgram,
    },
    actions: {
      handleSearchChange,
      handleFacultyFilterChange,
      handleDepartmentFilterChange,
      handleProgramFilterChange,
      handleMandatoryFilterChange,
      handleClearFilters,
      handlePageChange,
      handleOpenCreate,
      handleOpenAddRequirement,
      handleOpenEditRequirement,
      handleCloseForm,
      handleOpenDeleteRequirement,
      handleCloseDelete,
      handleOpenViewRequirement,
      handleCloseView,
      refetch,
    },
    flags: {
      hasData: filteredGroups.length > 0,
      isSearchOrFilterActive,
      canEdit,
      canDelete,
    },
  };
}
