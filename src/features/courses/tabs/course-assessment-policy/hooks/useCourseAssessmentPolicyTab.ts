import { useCallback, useReducer } from "react";
import { useGetCourseAssessmentPoliciesQuery } from "../api/courseAssessmentPoliciesApi";
import {
    courseAssessmentPolicyReducer,
    initialState,
} from "../state/courseAssessmentPolicyReducer";
import type {
    CourseAssessmentComponent,
    CourseAssessmentPolicy,
    ScopeFilter,
} from "../types/course-assessment-policy";

export function useCourseAssessmentPolicyTab() {
  // ─── Reducer ──────────────────────────────────────────────────────────────
  const [state, dispatch] = useReducer(
    courseAssessmentPolicyReducer,
    initialState,
  );

  // ─── Query ────────────────────────────────────────────────────────────────
  const queryParams = {
    sort: "breakdownName:asc",
    include: "courseConfig,courseConfig.course",
    page: state.page,
    itemsPerPage: state.itemsPerPage,
    ...(state.scopeFilter !== "ALL" && { "exact[scope]": state.scopeFilter }),
    ...(state.courseCodeSearch && {
      "search[breakdownName]": state.courseCodeSearch,
    }),
  };

  const { data, isLoading, isError, refetch } =
    useGetCourseAssessmentPoliciesQuery(queryParams);

  const policies = data?.member ?? [];
  const totalItems = data?.totalItems ?? 0;

  // ─── Derived Flags ────────────────────────────────────────────────────────
  const hasData = policies.length > 0;
  const hasGlobalPolicy = policies.some((p) => p.scope === "GLOBAL");

  // ─── Action Handlers ──────────────────────────────────────────────────────
  const handleScopeFilterChange = useCallback((value: ScopeFilter) => {
    dispatch({ type: "SET_SCOPE_FILTER", payload: value });
  }, []);

  const handleCourseCodeSearchChange = useCallback((value: string) => {
    dispatch({ type: "SET_COURSE_CODE_SEARCH", payload: value });
  }, []);

  const handlePageChange = useCallback((page: number, itemsPerPage: number) => {
    dispatch({ type: "SET_PAGE", payload: { page, itemsPerPage } });
  }, []);

  const handleExpandToggle = useCallback((policyId: number) => {
    dispatch({ type: "TOGGLE_EXPAND", payload: policyId });
  }, []);

  const handleOpenCreatePolicy = useCallback(() => {
    dispatch({ type: "OPEN_CREATE_POLICY" });
  }, []);

  const handleOpenEditPolicy = useCallback((policy: CourseAssessmentPolicy) => {
    dispatch({ type: "OPEN_EDIT_POLICY", payload: policy });
  }, []);

  const handleClosePolicy = useCallback(() => {
    dispatch({ type: "CLOSE_POLICY_FORM" });
  }, []);

  const handleOpenDeletePolicy = useCallback(
    (policy: CourseAssessmentPolicy, componentCount: number) => {
      dispatch({
        type: "OPEN_DELETE_POLICY",
        payload: { policy, componentCount },
      });
    },
    [],
  );

  const handleCloseDeletePolicy = useCallback(() => {
    dispatch({ type: "CLOSE_DELETE_POLICY" });
  }, []);

  const handleOpenAddComponent = useCallback(
    (policyId: number, totalWeight: number, usedWeight: number) => {
      dispatch({
        type: "OPEN_ADD_COMPONENT",
        payload: { policyId, totalWeight, usedWeight },
      });
    },
    [],
  );

  const handleOpenEditComponent = useCallback(
    (
      component: CourseAssessmentComponent,
      totalWeight: number,
      usedWeight: number,
    ) => {
      dispatch({
        type: "OPEN_EDIT_COMPONENT",
        payload: { component, totalWeight, usedWeight },
      });
    },
    [],
  );

  const handleCloseComponent = useCallback(() => {
    dispatch({ type: "CLOSE_COMPONENT_FORM" });
  }, []);

  const handleOpenDeleteComponent = useCallback(
    (component: CourseAssessmentComponent, isLast: boolean) => {
      dispatch({
        type: "OPEN_DELETE_COMPONENT",
        payload: { component, isLast },
      });
    },
    [],
  );

  const handleCloseDeleteComponent = useCallback(() => {
    dispatch({ type: "CLOSE_DELETE_COMPONENT" });
  }, []);

  // ─── Return ───────────────────────────────────────────────────────────────
  return {
    state: {
      policies,
      totalItems,
      isLoading,
      isError,
      scopeFilter: state.scopeFilter,
      courseCodeSearch: state.courseCodeSearch,
      page: state.page,
      itemsPerPage: state.itemsPerPage,
      totalItems,
      expandedPolicyIds: state.expandedPolicyIds,
      policyFormTarget: state.policyFormTarget,
      policyFormOpen: state.policyFormOpen,
      deletePolicyTarget: state.deletePolicyTarget,
      deletePolicyComponentCount: state.deletePolicyComponentCount,
      deletePolicyOpen: state.deletePolicyOpen,
      componentFormPolicyId: state.componentFormPolicyId,
      componentFormTarget: state.componentFormTarget,
      componentFormOpen: state.componentFormOpen,
      componentFormTotalWeight: state.componentFormTotalWeight,
      componentFormUsedWeight: state.componentFormUsedWeight,
      deleteComponentTarget: state.deleteComponentTarget,
      deleteComponentIsLast: state.deleteComponentIsLast,
      deleteComponentOpen: state.deleteComponentOpen,
    },
    actions: {
      handleScopeFilterChange,
      handleCourseCodeSearchChange,
      handlePageChange,
      handleExpandToggle,
      handleOpenCreatePolicy,
      handleOpenEditPolicy,
      handleClosePolicy,
      handleOpenDeletePolicy,
      handleCloseDeletePolicy,
      handleOpenAddComponent,
      handleOpenEditComponent,
      handleCloseComponent,
      handleOpenDeleteComponent,
      handleCloseDeleteComponent,
      refetch,
    },
    flags: {
      hasData,
      hasGlobalPolicy,
    },
  };
}
