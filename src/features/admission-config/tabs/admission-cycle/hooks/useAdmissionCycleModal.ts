import {
  ADMISSION_CYCLE_ROLLBACKS,
  ADMISSION_CYCLE_ROLLBACK_WARNINGS,
  ADMISSION_CYCLE_TRANSITIONS,
  ADMISSION_CYCLE_TRANSITION_WARNINGS,
  statusLabelByValue,
} from "@/shared/constants/admissionCycleOptions";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useCallback, useMemo, useReducer } from "react";
import {
  useCreateAdmissionCycleMutation,
  useDeleteAdmissionCycleMutation,
  useGetAdmissionCandidateCountQuery,
  useTransitionAdmissionCycleMutation,
  useUpdateAdmissionCycleMutation,
} from "../api/admissionCycleApi";
import type { LaneLockInfo } from "../components/modals/EntryModesMatrixInput";
import {
  admissionCycleFormReducer,
  AdmissionCycleFormActionType,
  initialAdmissionCycleFormState,
} from "../state/admissionCycleFormState";
import type {
  AcademicSessionOption,
  AdmissionCycle,
  AdmissionCycleLaneConfig,
  AdmissionCycleStatus,
  AdmissionEntryMode,
  TransitionDirection,
} from "../types/admission-cycle";
import {
  buildDefaultCycleName,
  getCyclesInSession,
  isBatchSlotOccupied,
  suggestNextBatchNo,
} from "../utils/admissionCycleDisplay";

type AdmissionCycleFormValues = {
  sessionId?: number;
  batchNo: number;
  supersedesCycleId?: number | null;
  name: string;
  entryModes: AdmissionCycleLaneConfig[];
  startDate?: Dayjs | null;
  endDate?: Dayjs | null;
};

const DEFAULT_CREATE_LANES: AdmissionCycleLaneConfig[] = [
  { entryMode: "UTME", identityMode: "JAMB", enabled: true },
];

function toIsoDateTime(value: Dayjs | null | undefined): string | null {
  if (!value) return null;
  return value.startOf("day").toISOString();
}

export function buildAdmissionCycleFormInitialValues(
  target: AdmissionCycle | null,
  sessions: AcademicSessionOption[],
  existingCycles: AdmissionCycle[],
): AdmissionCycleFormValues {
  if (target) {
    return {
      sessionId: target.sessionId,
      batchNo: target.batchNo,
      supersedesCycleId: target.supersedesCycleId,
      name: target.name,
      entryModes:
        target.entryModes && target.entryModes.length > 0
          ? target.entryModes
          : DEFAULT_CREATE_LANES,
      startDate: target.startDate ? dayjs(target.startDate) : null,
      endDate: target.endDate ? dayjs(target.endDate) : null,
    };
  }

  const currentSession = sessions.find((s) => s.isCurrent) ?? sessions[0];
  const sessionId = currentSession?.id;
  const batchNo =
    sessionId !== undefined
      ? suggestNextBatchNo(existingCycles, sessionId)
      : 1;

  return {
    sessionId,
    batchNo,
    supersedesCycleId: undefined,
    name:
      currentSession !== undefined
        ? buildDefaultCycleName(currentSession.name, batchNo)
        : "",
    entryModes: DEFAULT_CREATE_LANES,
    startDate: null,
    endDate: null,
  };
}

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

export function useAdmissionCycleFormModal(
  target: AdmissionCycle | null,
  open: boolean,
  onClose: () => void,
  sessions: AcademicSessionOption[],
  existingCycles: AdmissionCycle[],
) {
  const isEditMode = target !== null;
  const initialValues = useMemo(
    () => buildAdmissionCycleFormInitialValues(target, sessions, existingCycles),
    [target, sessions, existingCycles],
  );
  const [form] = Form.useForm<AdmissionCycleFormValues>();
  const [, dispatch] = useReducer(
    admissionCycleFormReducer,
    initialAdmissionCycleFormState,
  );

  const [createAdmissionCycle, { isLoading: isCreating }] =
    useCreateAdmissionCycleMutation();
  const [updateAdmissionCycle, { isLoading: isUpdating }] =
    useUpdateAdmissionCycleMutation();
  const handleApiError = useApiError();

  const isSubmitting = isCreating || isUpdating;

  const hasTargetLane = useCallback(
    (entryMode: AdmissionEntryMode) =>
      Boolean(target?.entryModes?.some((l) => l.entryMode === entryMode)),
    [target?.entryModes],
  );

  const utmeCountQuery = useGetAdmissionCandidateCountQuery(
    { cycleId: target?.id ?? 0, entryMode: "UTME" },
    { skip: !open || !isEditMode || !hasTargetLane("UTME") },
  );
  const deCountQuery = useGetAdmissionCandidateCountQuery(
    { cycleId: target?.id ?? 0, entryMode: "DIRECT_ENTRY" },
    { skip: !open || !isEditMode || !hasTargetLane("DIRECT_ENTRY") },
  );
  const transferCountQuery = useGetAdmissionCandidateCountQuery(
    { cycleId: target?.id ?? 0, entryMode: "TRANSFER" },
    { skip: !open || !isEditMode || !hasTargetLane("TRANSFER") },
  );

  const laneLocks = useMemo<Record<AdmissionEntryMode, LaneLockInfo>>(() => {
    const buildLock = (
      entryMode: AdmissionEntryMode,
      query: typeof utmeCountQuery,
    ): LaneLockInfo => {
      if (!isEditMode || !hasTargetLane(entryMode)) {
        return { locked: false, count: 0, isChecking: false };
      }
      const count = query.data?.totalItems ?? 0;
      const isChecking = query.isLoading || query.isFetching;
      return {
        locked: count > 0,
        count,
        isChecking,
      };
    };

    return {
      UTME: buildLock("UTME", utmeCountQuery),
      DIRECT_ENTRY: buildLock("DIRECT_ENTRY", deCountQuery),
      TRANSFER: buildLock("TRANSFER", transferCountQuery),
    };
  }, [
    isEditMode,
    hasTargetLane,
    utmeCountQuery,
    deCountQuery,
    transferCountQuery,
  ]);

  const sessionOptions = sessions.map((session) => ({
    value: session.id,
    label: session.isCurrent ? `${session.name} (Current)` : session.name,
  }));

  const watchedSessionId = Form.useWatch("sessionId", form);
  const watchedBatchNo = Form.useWatch("batchNo", form);

  const isSlotOccupied = useMemo(() => {
    if (isEditMode) return false;
    if (watchedSessionId === undefined || watchedBatchNo === undefined) {
      return false;
    }
    return isBatchSlotOccupied(
      existingCycles,
      watchedSessionId,
      watchedBatchNo,
    );
  }, [isEditMode, existingCycles, watchedSessionId, watchedBatchNo]);

  const supersedesOptions = useMemo(() => {
    if (isEditMode || watchedSessionId === undefined) {
      return [];
    }
    return getCyclesInSession(existingCycles, watchedSessionId).map((cycle) => ({
      value: cycle.id,
      label: `Batch ${cycle.batchNo} — ${cycle.name}`,
    }));
  }, [isEditMode, existingCycles, watchedSessionId]);

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: AdmissionCycleFormActionType.Reset });
  }, [form]);

  const prefillNameIfEmpty = useCallback(
    (sessionId: number, batchNo: number) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) return;
      const currentName = form.getFieldValue("name");
      if (!currentName || String(currentName).trim() === "") {
        form.setFieldValue("name", buildDefaultCycleName(session.name, batchNo));
      }
    },
    [form, sessions],
  );

  const handleSessionChange = useCallback(
    (sessionId: number) => {
      const batchNo = suggestNextBatchNo(existingCycles, sessionId);
      form.setFieldValue("batchNo", batchNo);
      form.setFieldValue("supersedesCycleId", undefined);
      prefillNameIfEmpty(sessionId, batchNo);
    },
    [form, existingCycles, prefillNameIfEmpty],
  );

  const handleBatchNoChange = useCallback(
    (batchNo: number | null) => {
      const sessionId = form.getFieldValue("sessionId") as number | undefined;
      if (sessionId === undefined || batchNo === null) return;
      prefillNameIfEmpty(sessionId, batchNo);
    },
    [form, prefillNameIfEmpty],
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!isEditMode && isSlotOccupied) {
        return;
      }

      const name = values.name.trim();
      const startDate = toIsoDateTime(values.startDate);
      const endDate = toIsoDateTime(values.endDate);
      const entryModes = (values.entryModes ?? []).map((lane) => ({
        entryMode: lane.entryMode,
        identityMode:
          lane.entryMode === "TRANSFER"
            ? ("OPEN" as const)
            : lane.identityMode,
        enabled: lane.enabled,
      }));

      if (isEditMode && target) {
        await updateAdmissionCycle({
          id: target.id,
          name,
          entryModes,
          startDate,
          endDate,
        }).unwrap();
        notifyMutationSuccess(
          mutationSuccessMessage("Admission cycle", "updated"),
        );
      } else {
        await createAdmissionCycle({
          sessionId: values.sessionId!,
          name,
          entryModes,
          batchNo: values.batchNo,
          supersedesCycleId: values.supersedesCycleId ?? undefined,
          startDate,
          endDate,
        }).unwrap();
        notifyMutationSuccess(
          mutationSuccessMessage("Admission cycle", "created"),
        );
      }

      reset();
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: {
          screen: RequestScreen.Modal,
          method: isEditMode ? "PUT" : "POST",
        },
        form,
      });
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  const supersededCycleName = useMemo(() => {
    if (!target?.supersedesCycleId) return null;
    const superseded = existingCycles.find(
      (c) => c.id === target.supersedesCycleId,
    );
    return superseded
      ? `Batch ${superseded.batchNo} — ${superseded.name}`
      : `Cycle #${target.supersedesCycleId}`;
  }, [target, existingCycles]);

  return {
    state: {
      isEditMode,
      isSubmitting,
      sessionOptions,
      supersedesOptions,
      laneLocks,
      isSlotOccupied,
      initialValues,
      supersededCycleName,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleSessionChange,
      handleBatchNoChange,
    },
    form,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteAdmissionCycleModal(
  target: AdmissionCycle | null,
  open: boolean,
  onClose: () => void,
) {
  const [deleteAdmissionCycle, { isLoading: isDeleting }] =
    useDeleteAdmissionCycleMutation();
  const handleApiError = useApiError();

  const { data: candidateData, isLoading: isCheckingCandidates } =
    useGetAdmissionCandidateCountQuery(
      { cycleId: target?.id ?? 0 },
      { skip: !open || !target },
    );

  const candidateCount = candidateData?.totalItems ?? 0;
  const canDelete = candidateCount === 0;

  const handleConfirm = async () => {
    if (!target || !canDelete) return;
    try {
      await deleteAdmissionCycle(target.id).unwrap();
      notifyMutationSuccess(
        mutationSuccessMessage("Admission cycle", "deleted"),
      );
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "DELETE" },
      });
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return {
    state: {
      isDeleting,
      isCheckingCandidates,
      candidateCount,
      canDelete,
    },
    actions: { handleConfirm, handleCancel },
  };
}

// ─── Transition ───────────────────────────────────────────────────────────────

export function useTransitionAdmissionCycleModal(
  target: AdmissionCycle | null,
  direction: TransitionDirection,
  onClose: () => void,
) {
  const [form] = Form.useForm<{ reason?: string }>();
  const [transitionAdmissionCycle, { isLoading: isTransitioning }] =
    useTransitionAdmissionCycleMutation();
  const handleApiError = useApiError();

  const isRollback = direction === "rollback";

  const forwardMeta =
    target && target.status !== "CLOSED"
      ? ADMISSION_CYCLE_TRANSITIONS[target.status]
      : null;
  const rollbackMeta =
    target && target.status !== "PRE_PROCESSING"
      ? ADMISSION_CYCLE_ROLLBACKS[target.status]
      : null;

  const targetStatus: AdmissionCycleStatus | null = isRollback
    ? (rollbackMeta?.prevStatus ?? null)
    : (forwardMeta?.nextStatus ?? null);

  const buttonLabel = isRollback
    ? (rollbackMeta?.buttonLabel ?? "Roll Back")
    : (forwardMeta?.buttonLabel ?? "Advance Status");

  const warningMessage =
    targetStatus !== null
      ? isRollback
        ? (ADMISSION_CYCLE_ROLLBACK_WARNINGS[targetStatus] ?? null)
        : (ADMISSION_CYCLE_TRANSITION_WARNINGS[targetStatus] ?? null)
      : null;

  const handleConfirm = async () => {
    if (!target || !targetStatus) return;
    try {
      const values = isRollback
        ? await form.validateFields()
        : { reason: undefined };

      await transitionAdmissionCycle({
        id: target.id,
        status: targetStatus,
        reason: values.reason?.trim(),
      }).unwrap();

      const statusLabel =
        statusLabelByValue[targetStatus] ?? targetStatus.replace(/_/g, " ");
      notifyMutationSuccess(
        isRollback
          ? `Cycle rolled back to ${statusLabel}.`
          : `Cycle advanced to ${statusLabel}.`,
      );
      form.resetFields();
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "PATCH" },
        form: isRollback ? form : undefined,
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return {
    state: {
      isTransitioning,
      isRollback,
      targetStatus,
      buttonLabel,
      warningMessage,
    },
    actions: { handleConfirm, handleCancel },
    form,
  };
}
