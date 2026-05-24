import {
  ADMISSION_CYCLE_TRANSITIONS,
  ADMISSION_CYCLE_TRANSITION_WARNINGS,
} from "@/shared/constants/admissionCycleOptions";
import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useCallback, useEffect, useReducer, useState } from "react";
import {
  useCreateAdmissionCycleMutation,
  useDeleteAdmissionCycleMutation,
  useGetAdmissionCandidateCountQuery,
  useTransitionAdmissionCycleMutation,
  useUpdateAdmissionCycleMutation,
} from "../api/admissionCycleApi";
import {
  admissionCycleFormReducer,
  AdmissionCycleFormActionType,
  initialAdmissionCycleFormState,
} from "../state/admissionCycleFormState";
import type {
  AcademicSessionOption,
  AdmissionCycle,
  AdmissionCycleStatus,
  AdmissionIdentityMode,
} from "../types/admission-cycle";

type AdmissionCycleFormValues = {
  sessionId?: number;
  name: string;
  admissionIdentityMode: AdmissionIdentityMode;
  startDate?: Dayjs | null;
  endDate?: Dayjs | null;
};

function toIsoDateTime(value: Dayjs | null | undefined): string | null {
  if (!value) return null;
  return value.startOf("day").toISOString();
}

function getTransitionMeta(status: AdmissionCycleStatus) {
  if (status === "CLOSED") return null;
  return ADMISSION_CYCLE_TRANSITIONS[status];
}

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

export function useAdmissionCycleFormModal(
  target: AdmissionCycle | null,
  open: boolean,
  onClose: () => void,
  sessions: AcademicSessionOption[],
  usedSessionIds: Set<number>,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<AdmissionCycleFormValues>();
  const [modalState, dispatch] = useReducer(
    admissionCycleFormReducer,
    initialAdmissionCycleFormState,
  );
  const { formError } = modalState;

  const [createAdmissionCycle, { isLoading: isCreating }] =
    useCreateAdmissionCycleMutation();
  const [updateAdmissionCycle, { isLoading: isUpdating }] =
    useUpdateAdmissionCycleMutation();

  const isSubmitting = isCreating || isUpdating;

  const sessionOptions = sessions.map((session) => ({
    value: session.id,
    label: session.isCurrent ? `${session.name} (Current)` : session.name,
    disabled: !isEditMode && usedSessionIds.has(session.id),
  }));

  useEffect(() => {
    if (!open) return;

    if (isEditMode && target) {
      form.setFieldsValue({
        sessionId: target.sessionId,
        name: target.name,
        admissionIdentityMode: target.admissionIdentityMode ?? "JAMB",
        startDate: target.startDate ? dayjs(target.startDate) : null,
        endDate: target.endDate ? dayjs(target.endDate) : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ admissionIdentityMode: "JAMB" });
    }
  }, [open, isEditMode, target, form]);

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: AdmissionCycleFormActionType.Reset });
  }, [form]);

  const handleSessionChange = useCallback(
    (sessionId: number) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) return;
      const currentName = form.getFieldValue("name");
      if (!currentName) {
        form.setFieldValue("name", `${session.name} UTME Admission`);
      }
    },
    [form, sessions],
  );

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      dispatch({
        type: AdmissionCycleFormActionType.SetFormError,
        message: null,
      });

      const name = values.name.trim();
      const startDate = toIsoDateTime(values.startDate);
      const endDate = toIsoDateTime(values.endDate);
      const admissionIdentityMode =
        values.admissionIdentityMode ?? target?.admissionIdentityMode ?? "JAMB";

      if (isEditMode && target) {
        await updateAdmissionCycle({
          id: target.id,
          name,
          admissionIdentityMode,
          startDate,
          endDate,
        }).unwrap();
        notification.success({
          message: "Admission cycle updated successfully.",
        });
      } else {
        await createAdmissionCycle({
          sessionId: values.sessionId!,
          name,
          admissionIdentityMode,
          startDate,
          endDate,
        }).unwrap();
        notification.success({
          message: "Admission cycle created successfully.",
        });
      }

      reset();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
      applyFormErrors(parsed, form, (msg) =>
        dispatch({
          type: AdmissionCycleFormActionType.SetFormError,
          message: msg,
        }),
      );
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  const canEditIdentityMode =
    !isEditMode || target?.status === "PRE_PROCESSING";

  return {
    state: {
      isEditMode,
      formError,
      isSubmitting,
      sessionOptions,
      canEditIdentityMode,
      identityMode: target?.admissionIdentityMode ?? "JAMB",
    },
    actions: { handleSubmit, handleCancel, handleSessionChange },
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
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
      await deleteAdmissionCycle(target.id).unwrap();
      notification.success({
        message: "Admission cycle deleted successfully.",
      });
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
      setError(parsed.message);
    }
  };

  const handleCancel = () => {
    setError(null);
    onClose();
  };

  return {
    state: {
      error,
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
  _open: boolean,
  onClose: () => void,
) {
  const [transitionAdmissionCycle, { isLoading: isTransitioning }] =
    useTransitionAdmissionCycleMutation();
  const [error, setError] = useState<string | null>(null);

  const transitionMeta = target ? getTransitionMeta(target.status) : null;
  const nextStatus = transitionMeta?.nextStatus ?? null;
  const buttonLabel = transitionMeta?.buttonLabel ?? "Advance Status";
  const warningMessage =
    nextStatus !== null
      ? ADMISSION_CYCLE_TRANSITION_WARNINGS[nextStatus] ?? null
      : null;

  const handleConfirm = async () => {
    if (!target || !nextStatus) return;
    try {
      setError(null);
      await transitionAdmissionCycle({
        id: target.id,
        status: nextStatus,
      }).unwrap();
      notification.success({
        message: `Cycle advanced to ${nextStatus.replace(/_/g, " ").toLowerCase()}.`,
      });
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
      setError(parsed.message);
    }
  };

  const handleCancel = () => {
    setError(null);
    onClose();
  };

  return {
    state: {
      error,
      isTransitioning,
      nextStatus,
      buttonLabel,
      warningMessage,
    },
    actions: { handleConfirm, handleCancel },
  };
}
