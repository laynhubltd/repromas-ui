import { useLazyGetRenderPackageQuery } from "@/features/admission-application/api/dynamicFormRuntimeApi";
import { useGetAdmissionCyclesQuery } from "@/features/admission-config/tabs/admission-cycle/api/admissionCycleApi";
import type { FormAssignment, FormTemplate } from "@/features/dynamic-form/types";
import { DYNAMIC_FORM_SLOT_CONFLICT_MESSAGE } from "@/shared/constants/dynamicFormOptions";
import { useApiError } from "@/shared/hooks/useApiError";
import type { AdmissionEntryMode } from "@/shared/types/admission-lane";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Modal } from "antd";
import { useCallback, useMemo, useReducer } from "react";
import {
  useActivateAssignmentMutation,
  useBulkAssignFormMutation,
  useDeactivateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetDynamicFormsQuery,
  useGetFormAssignmentsQuery,
} from "../api/dynamicFormAdminApi";
import {
  AssignmentPanelActionType,
  assignmentPanelReducer,
  initialAssignmentPanelState,
} from "../state/assignmentPanelState";
import {
  formatAssignmentSlotLabel,
  groupCycleAssignmentsByCycleId,
  resolveGlobalAssignmentSlots,
} from "../utils/resolveEffectiveFormSlots";

export function useAssignmentPanel() {
  const [state, dispatch] = useReducer(
    assignmentPanelReducer,
    initialAssignmentPanelState,
  );

  const {
    data: formsData,
    isLoading: isFormsLoading,
    isError: isFormsError,
    error: formsError,
  } = useGetDynamicFormsQuery({
    itemsPerPage: 100,
    "exact[status]": "PUBLISHED",
    "exact[purpose]": "ADMISSION_APPLICATION",
  });

  const {
    data: cyclesData,
    isLoading: isCyclesLoading,
    isError: isCyclesError,
    error: cyclesError,
  } = useGetAdmissionCyclesQuery({
    itemsPerPage: 100,
    sort: "name:asc",
  });

  const {
    data: assignmentsData,
    isLoading: isAssignmentsLoading,
    isError: isAssignmentsError,
    error: assignmentsError,
    refetch: refetchAssignments,
  } = useGetFormAssignmentsQuery({
    itemsPerPage: 100,
    "exact[purpose]": "ADMISSION_APPLICATION",
  });

  const [bulkAssign, { isLoading: isAssigning }] = useBulkAssignFormMutation();
  const [deactivateAssignment] = useDeactivateAssignmentMutation();
  const [activateAssignment] = useActivateAssignmentMutation();
  const [deleteAssignment, { isLoading: isDeleting }] =
    useDeleteAssignmentMutation();

  const [
    triggerPreview,
    {
      data: previewPackage,
      isFetching: isPreviewLoading,
      error: previewError,
    },
  ] = useLazyGetRenderPackageQuery();

  const handleApiError = useApiError();

  const publishedForms: FormTemplate[] = useMemo(
    () => formsData?.member ?? [],
    [formsData?.member],
  );
  const cycles = useMemo(
    () => cyclesData?.member ?? [],
    [cyclesData?.member],
  );
  const assignments: FormAssignment[] = useMemo(
    () => assignmentsData?.member ?? [],
    [assignmentsData?.member],
  );

  const formsById = useMemo(() => {
    const map = new Map<number, FormTemplate>();
    for (const f of publishedForms) map.set(f.id, f);
    return map;
  }, [publishedForms]);

  const globalSlots = useMemo(
    () => resolveGlobalAssignmentSlots(assignments),
    [assignments],
  );

  const cycleAssignmentsByCycle = useMemo(
    () => groupCycleAssignmentsByCycleId(assignments),
    [assignments],
  );

  const selectedForm =
    publishedForms.find((f) => f.id === state.selectedFormId) ?? null;

  const isLoading = isFormsLoading || isCyclesLoading || isAssignmentsLoading;
  const sectionError =
    deriveSectionErrorMessage(isAssignmentsError, assignmentsError, {
      screen: RequestScreen.List,
      method: "GET",
    }) ??
    deriveSectionErrorMessage(isCyclesError, cyclesError, {
      screen: RequestScreen.List,
      method: "GET",
    }) ??
    deriveSectionErrorMessage(isFormsError, formsError, {
      screen: RequestScreen.List,
      method: "GET",
    });

  const setSelectedFormId = useCallback((formId: number | null) => {
    dispatch({
      type: AssignmentPanelActionType.SetSelectedFormId,
      formId,
    });
  }, []);

  const setSelectedEntryMode = useCallback(
    (entryMode: AdmissionEntryMode | null) => {
      if (entryMode === null) {
        dispatch({
          type: AssignmentPanelActionType.SetSelectedEntryMode,
          entryMode: null,
        });
        return;
      }

      const eligibleCycleIds = new Set(
        cycles
          .filter((c) => c.entryModes?.some((l) => l.entryMode === entryMode))
          .map((c) => c.id),
      );
      const prunedCycleIds = state.selectedCycleIds.filter((id) =>
        eligibleCycleIds.has(id),
      );

      dispatch({
        type: AssignmentPanelActionType.SetSelectedEntryMode,
        entryMode,
        prunedCycleIds,
      });
    },
    [cycles, state.selectedCycleIds],
  );

  const setSelectedCycleIds = useCallback((cycleIds: number[]) => {
    dispatch({
      type: AssignmentPanelActionType.SetSelectedCycleIds,
      cycleIds,
    });
  }, []);

  const setPriority = useCallback((priority: number) => {
    dispatch({
      type: AssignmentPanelActionType.SetPriority,
      priority,
    });
  }, []);

  const handleBulkAssign = useCallback(async () => {
    if (!state.selectedFormId || state.selectedCycleIds.length === 0) return;
    dispatch({ type: AssignmentPanelActionType.ClearConflict });
    try {
      await bulkAssign({
        formId: state.selectedFormId,
        assignmentScope: "ADMISSION_CYCLE",
        assignmentReferenceIds: state.selectedCycleIds,
        entryMode: state.selectedEntryMode,
        priority: state.priority,
      }).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Assignments", "created"));
      dispatch({
        type: AssignmentPanelActionType.SetSelectedCycleIds,
        cycleIds: [],
      });
      refetchAssignments();
    } catch (err: unknown) {
      const decision = handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
      if (decision.parsed.status === 409) {
        dispatch({
          type: AssignmentPanelActionType.SetSlotConflict,
          message:
            decision.parsed.message || DYNAMIC_FORM_SLOT_CONFLICT_MESSAGE,
          scope: "ADMISSION_CYCLE",
          entryMode: state.selectedEntryMode,
        });
      }
    }
  }, [
    state.selectedFormId,
    state.selectedCycleIds,
    state.selectedEntryMode,
    state.priority,
    bulkAssign,
    refetchAssignments,
    handleApiError,
  ]);

  const handleAssignGlobal = useCallback(async () => {
    if (!state.selectedFormId) return;
    dispatch({ type: AssignmentPanelActionType.ClearConflict });
    try {
      await bulkAssign({
        formId: state.selectedFormId,
        assignmentScope: "GLOBAL",
        entryMode: state.selectedEntryMode,
        priority: state.priority,
      }).unwrap();
      notifyMutationSuccess(
        mutationSuccessMessage("Global assignment", "created"),
      );
      refetchAssignments();
    } catch (err: unknown) {
      const decision = handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
      if (decision.parsed.status === 409) {
        dispatch({
          type: AssignmentPanelActionType.SetSlotConflict,
          message:
            decision.parsed.message || DYNAMIC_FORM_SLOT_CONFLICT_MESSAGE,
          scope: "GLOBAL",
          entryMode: state.selectedEntryMode,
        });
      }
    }
  }, [
    state.selectedFormId,
    state.selectedEntryMode,
    state.priority,
    bulkAssign,
    refetchAssignments,
    handleApiError,
  ]);

  const conflictingAssignments = useMemo<FormAssignment[]>(() => {
    if (!state.slotConflict) return [];
    const targetMode = state.conflictEntryMode ?? null;

    if (state.conflictScope === "GLOBAL") {
      return assignments.filter(
        (a) =>
          a.assignmentScope === "GLOBAL" &&
          a.purpose === "ADMISSION_APPLICATION" &&
          a.isActive &&
          (a.entryMode ?? null) === targetMode,
      );
    }

    const selectedSet = new Set(state.selectedCycleIds);
    return assignments.filter(
      (a) =>
        a.assignmentScope === "ADMISSION_CYCLE" &&
        a.purpose === "ADMISSION_APPLICATION" &&
        a.isActive &&
        a.assignmentReferenceId != null &&
        selectedSet.has(a.assignmentReferenceId) &&
        (a.entryMode ?? null) === targetMode,
    );
  }, [
    state.slotConflict,
    state.conflictScope,
    state.conflictEntryMode,
    state.selectedCycleIds,
    assignments,
  ]);

  const handleDeactivate = useCallback(
    async (assignmentId: number) => {
      try {
        await deactivateAssignment(assignmentId).unwrap();
        notifyMutationSuccess(mutationSuccessMessage("Assignment", "updated"));
        dispatch({ type: AssignmentPanelActionType.ClearConflict });
        refetchAssignments();
      } catch (err: unknown) {
        handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "POST" },
        });
      }
    },
    [deactivateAssignment, refetchAssignments, handleApiError],
  );

  const handleActivate = useCallback(
    async (assignmentId: number) => {
      try {
        await activateAssignment(assignmentId).unwrap();
        notifyMutationSuccess(mutationSuccessMessage("Assignment", "updated"));
        refetchAssignments();
      } catch (err: unknown) {
        handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "POST" },
        });
      }
    },
    [activateAssignment, refetchAssignments, handleApiError],
  );

  const cycleNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of cycles) map.set(c.id, c.name);
    return map;
  }, [cycles]);

  const assignmentScopeLabel = useCallback(
    (assignment: FormAssignment) => {
      const slotLabel = formatAssignmentSlotLabel(assignment.entryMode);
      if (assignment.assignmentScope === "GLOBAL") {
        return `GLOBAL · ${slotLabel}`;
      }
      const cycleName =
        cycleNameById.get(assignment.assignmentReferenceId ?? -1) ??
        `Cycle #${assignment.assignmentReferenceId}`;
      return `${cycleName} · ${slotLabel}`;
    },
    [cycleNameById],
  );

  const handleDelete = useCallback(
    (assignment: FormAssignment) => {
      const form =
        publishedForms.find((f) => f.id === assignment.formId) ?? null;
      const scopeLabel = assignmentScopeLabel(assignment);

      Modal.confirm({
        title: "Delete assignment?",
        content: `Remove the assignment for "${form?.name ?? `Form #${assignment.formId}`}" (${scopeLabel})? If candidate submissions already exist on this slot, deletion will be blocked — use Deactivate instead.`,
        okText: "Delete",
        okButtonProps: { danger: true },
        cancelText: "Cancel",
        onOk: async () => {
          try {
            await deleteAssignment(assignment.id).unwrap();
            notifyMutationSuccess(
              mutationSuccessMessage("Assignment", "deleted"),
            );
            dispatch({ type: AssignmentPanelActionType.ClearConflict });
            refetchAssignments();
          } catch (err: unknown) {
            handleApiError(err, {
              context: { screen: RequestScreen.Action, method: "DELETE" },
            });
          }
        },
      });
    },
    [
      publishedForms,
      assignmentScopeLabel,
      deleteAssignment,
      refetchAssignments,
      handleApiError,
    ],
  );

  const handleRetryAssign = useCallback(() => {
    if (state.conflictScope === "GLOBAL") {
      void handleAssignGlobal();
    } else if (state.conflictScope === "ADMISSION_CYCLE") {
      void handleBulkAssign();
    }
  }, [state.conflictScope, handleAssignGlobal, handleBulkAssign]);

  const handleOpenPreview = useCallback(
    (cycleId: number, cycleName: string, entryMode: AdmissionEntryMode) => {
      dispatch({
        type: AssignmentPanelActionType.OpenPreview,
        target: { cycleId, cycleName, entryMode },
      });
      void triggerPreview({
        purpose: "ADMISSION_APPLICATION",
        assignmentScope: "ADMISSION_CYCLE",
        assignmentReferenceId: cycleId,
        entryMode,
      });
    },
    [triggerPreview],
  );

  const handleClosePreview = useCallback(() => {
    dispatch({ type: AssignmentPanelActionType.ClosePreview });
  }, []);

  const previewErrorMessage = previewError
    ? deriveSectionErrorMessage(true, previewError, {
        screen: RequestScreen.Detail,
        method: "GET",
      })
    : null;

  return {
    state: {
      publishedForms,
      formsById,
      cycles,
      assignments,
      selectedFormId: state.selectedFormId,
      selectedEntryMode: state.selectedEntryMode,
      selectedForm,
      selectedCycleIds: state.selectedCycleIds,
      priority: state.priority,
      globalSlots,
      cycleAssignmentsByCycle,
      slotConflict: state.slotConflict,
      conflictingAssignments,
      cycleNameById,
      isLoading,
      sectionError,
      isAssigning,
      isDeleting,
      previewTarget: state.previewTarget,
      previewPackage,
      isPreviewLoading,
      previewErrorMessage,
    },
    actions: {
      setSelectedFormId,
      setSelectedEntryMode,
      setSelectedCycleIds,
      setPriority,
      handleBulkAssign,
      handleAssignGlobal,
      handleDeactivate,
      handleActivate,
      handleDelete,
      handleRetryAssign,
      handleOpenPreview,
      handleClosePreview,
      refetchAssignments,
    },
  };
}
