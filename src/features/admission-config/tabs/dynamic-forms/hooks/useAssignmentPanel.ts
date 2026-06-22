import { useGetAdmissionCyclesQuery } from "@/features/admission-config/tabs/admission-cycle/api/admissionCycleApi";
import type { FormAssignment, FormTemplate } from "@/features/dynamic-form/types";
import { useApiError } from "@/shared/hooks/useApiError";
import { DYNAMIC_FORM_SLOT_CONFLICT_MESSAGE } from "@/shared/constants/dynamicFormOptions";
import { RequestScreen } from "@/shared/types/error-ui";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Modal } from "antd";
import { useCallback, useMemo, useState } from "react";
import {
  useActivateAssignmentMutation,
  useBulkAssignFormMutation,
  useDeactivateAssignmentMutation,
  useDeleteAssignmentMutation,
  useGetDynamicFormsQuery,
  useGetFormAssignmentsQuery,
} from "../api/dynamicFormAdminApi";

export function useAssignmentPanel() {
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [selectedCycleIds, setSelectedCycleIds] = useState<number[]>([]);
  const [priority, setPriority] = useState(100);
  const [slotConflict, setSlotConflict] = useState<string | null>(null);
  const [conflictScope, setConflictScope] = useState<
    "ADMISSION_CYCLE" | "GLOBAL" | null
  >(null);

  const { data: formsData } = useGetDynamicFormsQuery({
    itemsPerPage: 100,
    "exact[status]": "PUBLISHED",
    "exact[purpose]": "ADMISSION_APPLICATION",
  });

  const { data: cyclesData } = useGetAdmissionCyclesQuery({
    itemsPerPage: 100,
    sort: "name:asc",
  });

  const { data: assignmentsData, refetch: refetchAssignments } =
    useGetFormAssignmentsQuery({
      itemsPerPage: 200,
      "exact[purpose]": "ADMISSION_APPLICATION",
    });

  const [bulkAssign, { isLoading: isAssigning }] = useBulkAssignFormMutation();
  const [deactivateAssignment] = useDeactivateAssignmentMutation();
  const [activateAssignment] = useActivateAssignmentMutation();
  const [deleteAssignment, { isLoading: isDeleting }] =
    useDeleteAssignmentMutation();
  const handleApiError = useApiError();

  const publishedForms: FormTemplate[] = formsData?.member ?? [];
  const cycles = cyclesData?.member ?? [];
  const assignments: FormAssignment[] = assignmentsData?.member ?? [];

  const globalAssignment = useMemo(
    () =>
      assignments.find(
        (a) =>
          a.assignmentScope === "GLOBAL" &&
          a.purpose === "ADMISSION_APPLICATION",
      ) ?? null,
    [assignments],
  );

  const cycleAssignments = useMemo(() => {
    const map = new Map<number, FormAssignment>();
    for (const a of assignments) {
      if (
        a.assignmentScope !== "ADMISSION_CYCLE" ||
        a.assignmentReferenceId == null
      ) {
        continue;
      }
      const existing = map.get(a.assignmentReferenceId);
      if (!existing || (a.isActive && !existing.isActive)) {
        map.set(a.assignmentReferenceId, a);
      }
    }
    return map;
  }, [assignments]);

  const selectedForm = publishedForms.find((f) => f.id === selectedFormId) ?? null;

  const handleBulkAssign = useCallback(async () => {
    if (!selectedFormId || selectedCycleIds.length === 0) return;
    setSlotConflict(null);
    setConflictScope(null);
    try {
      await bulkAssign({
        formId: selectedFormId,
        assignmentScope: "ADMISSION_CYCLE",
        assignmentReferenceIds: selectedCycleIds,
        priority,
      }).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Assignments", "created"));
      setSelectedCycleIds([]);
      refetchAssignments();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      if (parsed.status === 409) {
        setSlotConflict(parsed.message || DYNAMIC_FORM_SLOT_CONFLICT_MESSAGE);
        setConflictScope("ADMISSION_CYCLE");
      } else {
        handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "POST" },
        });
      }
    }
  }, [
    selectedFormId,
    selectedCycleIds,
    priority,
    bulkAssign,
    refetchAssignments,
    handleApiError,
  ]);

  const handleAssignGlobal = useCallback(async () => {
    if (!selectedFormId) return;
    setSlotConflict(null);
    setConflictScope(null);
    try {
      await bulkAssign({
        formId: selectedFormId,
        assignmentScope: "GLOBAL",
        priority,
      }).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Global assignment", "created"));
      refetchAssignments();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      if (parsed.status === 409) {
        setSlotConflict(parsed.message || DYNAMIC_FORM_SLOT_CONFLICT_MESSAGE);
        setConflictScope("GLOBAL");
      } else {
        handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "POST" },
        });
      }
    }
  }, [selectedFormId, priority, bulkAssign, refetchAssignments, handleApiError]);

  const conflictingAssignments = useMemo<FormAssignment[]>(() => {
    if (!slotConflict) return [];
    if (conflictScope === "GLOBAL") {
      return globalAssignment && globalAssignment.isActive
        ? [globalAssignment]
        : [];
    }
    return selectedCycleIds
      .map((id) => cycleAssignments.get(id))
      .filter((a): a is FormAssignment => !!a);
  }, [
    slotConflict,
    conflictScope,
    globalAssignment,
    selectedCycleIds,
    cycleAssignments,
  ]);

  const handleDeactivate = useCallback(
    async (assignmentId: number) => {
      try {
        await deactivateAssignment(assignmentId).unwrap();
        notifyMutationSuccess(mutationSuccessMessage("Assignment", "updated"));
        setSlotConflict(null);
        setConflictScope(null);
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
      if (assignment.assignmentScope === "GLOBAL") return "GLOBAL fallback";
      return (
        cycleNameById.get(assignment.assignmentReferenceId ?? -1) ??
        `Cycle #${assignment.assignmentReferenceId}`
      );
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
        content: `Remove the assignment for "${form?.name ?? `Form #${assignment.formId}`}" (${scopeLabel})? This cannot be undone.`,
        okText: "Delete",
        okButtonProps: { danger: true },
        cancelText: "Cancel",
        onOk: async () => {
          try {
            await deleteAssignment(assignment.id).unwrap();
            notifyMutationSuccess(mutationSuccessMessage("Assignment", "deleted"));
            setSlotConflict(null);
            setConflictScope(null);
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
    if (conflictScope === "GLOBAL") {
      void handleAssignGlobal();
    } else if (conflictScope === "ADMISSION_CYCLE") {
      void handleBulkAssign();
    }
  }, [conflictScope, handleAssignGlobal, handleBulkAssign]);

  return {
    state: {
      publishedForms,
      cycles,
      assignments,
      selectedFormId,
      selectedForm,
      selectedCycleIds,
      priority,
      globalAssignment,
      cycleAssignments,
      slotConflict,
      conflictingAssignments,
      cycleNameById,
      isAssigning,
      isDeleting,
    },
    actions: {
      setSelectedFormId,
      setSelectedCycleIds,
      setPriority,
      handleBulkAssign,
      handleAssignGlobal,
      handleDeactivate,
      handleActivate,
      handleDelete,
      handleRetryAssign,
      setSlotConflict,
      refetchAssignments,
    },
  };
}
