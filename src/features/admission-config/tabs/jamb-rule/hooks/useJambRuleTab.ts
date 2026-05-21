import { useGetDepartmentsQuery } from "@/features/academic-structure/api/departmentsApi";
import { useGetFacultiesQuery } from "@/features/academic-structure/api/facultiesApi";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import {
  JAMB_COMBINATION_LIST_ITEMS_PER_PAGE,
  JAMB_COMBINATION_LIST_SORT_DEFAULT,
  JAMB_GROUP_INCLUDE,
  JAMB_GROUP_LIST_SORT_DEFAULT,
  JAMB_OPTION_INCLUDE,
} from "@/shared/constants/jambRuleOptions";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import {
  useGetJambCombinationGroupsQuery,
  useGetJambCombinationOptionsQuery,
  useGetJambSubjectCombinationsQuery,
} from "../api/jambRuleApi";
import {
  initialJambRuleTabState,
  jambRuleTabReducer,
  JambRuleTabActionType,
} from "../state/jambRuleTabState";
import type {
  JambCombinationGroup,
  JambCombinationOption,
  JambSubjectCombination,
} from "../types/jamb-rule";

const DEBOUNCE_MS = 300;

export function useJambRuleTab() {
  const [state, dispatch] = useReducer(
    jambRuleTabReducer,
    initialJambRuleTabState,
  );

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const queryParams = {
    page: state.page,
    itemsPerPage: JAMB_COMBINATION_LIST_ITEMS_PER_PAGE,
    sort: JAMB_COMBINATION_LIST_SORT_DEFAULT,
    ...(state.scopeFilter ? { "exact[scope]": state.scopeFilter } : {}),
    ...(state.debouncedSearch
      ? { "search[name]": state.debouncedSearch }
      : {}),
  };

  const {
    data: combinationsData,
    isLoading: isCombinationsLoading,
    isError: isCombinationsError,
    refetch: refetchCombinations,
  } = useGetJambSubjectCombinationsQuery(queryParams);

  const combinations = combinationsData?.member ?? [];
  const totalItems = combinationsData?.totalItems ?? 0;

  const { data: globalData } = useGetJambSubjectCombinationsQuery(
    { "exact[scope]": "GLOBAL", itemsPerPage: 1 },
    { skip: false },
  );

  const hasGlobalRule = (globalData?.totalItems ?? 0) > 0;

  const selectedCombination = useMemo(
    () =>
      combinations.find((c) => c.id === state.selectedCombinationId) ?? null,
    [combinations, state.selectedCombinationId],
  );

  const {
    data: groupsData,
    isLoading: isGroupsLoading,
    isError: isGroupsError,
    refetch: refetchGroups,
  } = useGetJambCombinationGroupsQuery(
    {
      "exact[combinationId]": state.selectedCombinationId ?? undefined,
      sort: JAMB_GROUP_LIST_SORT_DEFAULT,
      include: JAMB_GROUP_INCLUDE,
      itemsPerPage: 100,
    },
    { skip: state.selectedCombinationId == null },
  );

  const groups = groupsData?.member ?? [];

  const optionFormGroupId =
    state.optionFormTarget?.groupId ?? state.optionFormPresetGroupId;

  const { data: optionFormGroupOptionsData } = useGetJambCombinationOptionsQuery(
    {
      "exact[groupId]": optionFormGroupId,
      include: JAMB_OPTION_INCLUDE,
      itemsPerPage: 100,
    },
    { skip: !state.optionFormOpen || optionFormGroupId == null },
  );

  const optionFormExcludedSubjectIds = useMemo(() => {
    const options = optionFormGroupOptionsData?.member ?? [];
    if (state.optionFormTarget) {
      return options
        .filter((o) => o.id !== state.optionFormTarget!.id)
        .map((o) => o.subjectId);
    }
    return options.map((o) => o.subjectId);
  }, [optionFormGroupOptionsData, state.optionFormTarget]);

  const optionFormGroup = useMemo(() => {
    const groupId =
      state.optionFormTarget?.groupId ?? state.optionFormPresetGroupId;
    if (groupId == null) return null;
    return groups.find((g) => g.id === groupId) ?? null;
  }, [
    groups,
    state.optionFormTarget,
    state.optionFormPresetGroupId,
  ]);

  const optionFormGroupContext = useMemo(() => {
    if (!optionFormGroup) return null;
    const currentOptionCount = optionFormGroupOptionsData?.member.length ?? 0;
    return {
      requirementType: optionFormGroup.requirementType,
      requiredCount: optionFormGroup.requiredCount,
      currentOptionCount,
    };
  }, [optionFormGroup, optionFormGroupOptionsData]);

  const groupFormGroupId = state.groupFormTarget?.id;

  const { data: groupFormOptionsData } = useGetJambCombinationOptionsQuery(
    {
      "exact[groupId]": groupFormGroupId,
      itemsPerPage: 100,
    },
    { skip: !state.groupFormOpen || groupFormGroupId == null },
  );

  const groupFormExistingOptionCount =
    groupFormOptionsData?.member.length ?? 0;

  const { data: facultiesData } = useGetFacultiesQuery({
    itemsPerPage: 100,
    sort: "name:asc",
  });

  const { data: departmentsData } = useGetDepartmentsQuery({
    itemsPerPage: 100,
    sort: "name:asc",
  });

  const { data: programsData } = useGetProgramsQuery({
    itemsPerPage: 100,
    sort: "name:asc",
  });

  const faculties = facultiesData?.member ?? [];
  const departments = departmentsData?.member ?? [];
  const programs = programsData?.member ?? [];

  useEffect(() => {
    if (
      combinations.length > 0 &&
      state.selectedCombinationId == null &&
      !isCombinationsLoading
    ) {
      dispatch({
        type: JambRuleTabActionType.SelectCombination,
        id: combinations[0].id,
      });
    }
  }, [combinations, state.selectedCombinationId, isCombinationsLoading]);

  const handleSearchChange = useCallback((value: string) => {
    dispatch({ type: JambRuleTabActionType.SetSearch, value });
    dispatch({ type: JambRuleTabActionType.SetPage, value: 1 });

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      dispatch({
        type: JambRuleTabActionType.SetDebouncedSearch,
        value,
      });
    }, DEBOUNCE_MS);
  }, []);

  const handleScopeFilterChange = useCallback(
    (value: JambSubjectCombination["scope"] | undefined) => {
      dispatch({ type: JambRuleTabActionType.SetScopeFilter, value });
    },
    [],
  );

  const handlePageChange = useCallback((page: number) => {
    dispatch({ type: JambRuleTabActionType.SetPage, value: page });
  }, []);

  const handleSelectCombination = useCallback((id: number | null) => {
    dispatch({ type: JambRuleTabActionType.SelectCombination, id });
  }, []);

  const handleClearFilters = useCallback(() => {
    dispatch({ type: JambRuleTabActionType.SetScopeFilter, value: undefined });
    dispatch({ type: JambRuleTabActionType.SetSearch, value: "" });
    dispatch({
      type: JambRuleTabActionType.SetDebouncedSearch,
      value: "",
    });
    dispatch({ type: JambRuleTabActionType.SetPage, value: 1 });
  }, []);

  const handleOpenCreateCombination = useCallback(() => {
    dispatch({
      type: JambRuleTabActionType.OpenCombinationForm,
      target: null,
    });
  }, []);

  const handleOpenEditCombination = useCallback(
    (target: JambSubjectCombination) => {
      dispatch({
        type: JambRuleTabActionType.OpenCombinationForm,
        target,
      });
    },
    [],
  );

  const handleCloseCombinationForm = useCallback(() => {
    dispatch({ type: JambRuleTabActionType.CloseCombinationForm });
  }, []);

  const handleOpenDeleteCombination = useCallback(
    (target: JambSubjectCombination) => {
      dispatch({
        type: JambRuleTabActionType.OpenDeleteCombination,
        target,
      });
    },
    [],
  );

  const handleCloseDeleteCombination = useCallback(() => {
    dispatch({ type: JambRuleTabActionType.CloseDeleteCombination });
  }, []);

  const handleOpenCreateGroup = useCallback(() => {
    dispatch({ type: JambRuleTabActionType.OpenGroupForm, target: null });
  }, []);

  const handleOpenEditGroup = useCallback((target: JambCombinationGroup) => {
    dispatch({ type: JambRuleTabActionType.OpenGroupForm, target });
  }, []);

  const handleCloseGroupForm = useCallback(() => {
    dispatch({ type: JambRuleTabActionType.CloseGroupForm });
  }, []);

  const handleOpenDeleteGroup = useCallback((target: JambCombinationGroup) => {
    dispatch({ type: JambRuleTabActionType.OpenDeleteGroup, target });
  }, []);

  const handleCloseDeleteGroup = useCallback(() => {
    dispatch({ type: JambRuleTabActionType.CloseDeleteGroup });
  }, []);

  const handleOpenCreateOption = useCallback((groupId: number) => {
    dispatch({
      type: JambRuleTabActionType.OpenOptionForm,
      target: null,
      presetGroupId: groupId,
    });
  }, []);

  const handleOpenEditOption = useCallback((target: JambCombinationOption) => {
    dispatch({ type: JambRuleTabActionType.OpenOptionForm, target });
  }, []);

  const handleCloseOptionForm = useCallback(() => {
    dispatch({ type: JambRuleTabActionType.CloseOptionForm });
  }, []);

  const handleOpenDeleteOption = useCallback(
    (target: JambCombinationOption) => {
      dispatch({ type: JambRuleTabActionType.OpenDeleteOption, target });
    },
    [],
  );

  const handleCloseDeleteOption = useCallback(() => {
    dispatch({ type: JambRuleTabActionType.CloseDeleteOption });
  }, []);

  const refetch = useCallback(() => {
    refetchCombinations();
    if (state.selectedCombinationId != null) {
      refetchGroups();
    }
  }, [refetchCombinations, refetchGroups, state.selectedCombinationId]);

  const activeFilterCount = [state.scopeFilter].filter(
    (v) => v !== undefined,
  ).length;

  const isSearchOrFilterActive =
    state.debouncedSearch.trim().length > 0 || activeFilterCount > 0;

  const isLoading = isCombinationsLoading;
  const isError = isCombinationsError;
  const hasData = combinations.length > 0;

  return {
    state: {
      combinations,
      totalItems,
      hasGlobalRule,
      selectedCombination,
      selectedCombinationId: state.selectedCombinationId,
      groups,
      isGroupsLoading,
      isGroupsError,
      faculties,
      departments,
      programs,
      isLoading,
      isError,
      search: state.search,
      scopeFilter: state.scopeFilter,
      page: state.page,
      combinationFormTarget: state.combinationFormTarget,
      combinationFormOpen: state.combinationFormOpen,
      deleteCombinationTarget: state.deleteCombinationTarget,
      groupFormTarget: state.groupFormTarget,
      groupFormOpen: state.groupFormOpen,
      deleteGroupTarget: state.deleteGroupTarget,
      optionFormTarget: state.optionFormTarget,
      optionFormPresetGroupId: state.optionFormPresetGroupId,
      optionFormOpen: state.optionFormOpen,
      deleteOptionTarget: state.deleteOptionTarget,
      activeFilterCount,
      optionFormExcludedSubjectIds,
      groupFormExistingOptionCount,
      optionFormGroupContext,
    },
    actions: {
      handleSearchChange,
      handleScopeFilterChange,
      handlePageChange,
      handleSelectCombination,
      handleClearFilters,
      handleOpenCreateCombination,
      handleOpenEditCombination,
      handleCloseCombinationForm,
      handleOpenDeleteCombination,
      handleCloseDeleteCombination,
      handleOpenCreateGroup,
      handleOpenEditGroup,
      handleCloseGroupForm,
      handleOpenDeleteGroup,
      handleCloseDeleteGroup,
      handleOpenCreateOption,
      handleOpenEditOption,
      handleCloseOptionForm,
      handleOpenDeleteOption,
      handleCloseDeleteOption,
      refetch,
    },
    flags: {
      hasData,
      isSearchOrFilterActive,
    },
  };
}
