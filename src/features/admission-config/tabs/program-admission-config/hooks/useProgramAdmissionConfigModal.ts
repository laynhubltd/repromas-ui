import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { Form, notification } from "antd";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import {
  useCreateProgramAdmissionConfigMutation,
  useDeleteProgramAdmissionConfigMutation,
  useUpdateProgramAdmissionConfigMutation,
} from "../api/programAdmissionConfigApi";
import {
  initialProgramAdmissionConfigFormState,
  programAdmissionConfigFormReducer,
  ProgramAdmissionConfigFormActionType,
} from "../state/programAdmissionConfigFormState";
import type {
  ProgramAdmissionConfig,
  ProgramAdmissionConfigFormValues,
} from "../types/program-admission-config";
import {
  validateCutoffOrdering,
  validateQuotaTotals,
} from "../utils/validators";

type ProgramOption = {
  id: number;
  name: string;
  department?: { name: string } | null;
};

function buildPayload(values: ProgramAdmissionConfigFormValues) {
  return {
    programId: values.programId,
    totalCapacity: values.totalCapacity,
    meritPercentage: values.meritPercentage,
    catchmentPercentage: values.catchmentPercentage,
    eldsPercentage: values.eldsPercentage,
    meritCutoff: values.meritCutoff.toFixed(2),
    catchmentCutoff: values.catchmentCutoff.toFixed(2),
    eldsCutoff: values.eldsCutoff.toFixed(2),
  };
}

export function useProgramAdmissionConfigFormModal(
  target: ProgramAdmissionConfig | null,
  open: boolean,
  onClose: () => void,
  programs: ProgramOption[],
  configs: ProgramAdmissionConfig[],
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<ProgramAdmissionConfigFormValues>();
  const [modalState, dispatch] = useReducer(
    programAdmissionConfigFormReducer,
    initialProgramAdmissionConfigFormState,
  );

  const [createConfig, { isLoading: isCreating }] =
    useCreateProgramAdmissionConfigMutation();
  const [updateConfig, { isLoading: isUpdating }] =
    useUpdateProgramAdmissionConfigMutation();
  const handleApiError = useApiError();

  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (!open) return;
    if (isEditMode && target) {
      form.setFieldsValue({
        programId: target.programId,
        totalCapacity: target.totalCapacity,
        meritPercentage: target.meritPercentage,
        catchmentPercentage: target.catchmentPercentage,
        eldsPercentage: target.eldsPercentage,
        meritCutoff: Number(target.meritCutoff),
        catchmentCutoff: Number(target.catchmentCutoff),
        eldsCutoff: Number(target.eldsCutoff),
      });
      return;
    }

    form.setFieldsValue({
      programId: undefined,
      totalCapacity: 100,
      meritPercentage: 45,
      catchmentPercentage: 30,
      eldsPercentage: 25,
      meritCutoff: 60,
      catchmentCutoff: 55,
      eldsCutoff: 50,
    });
  }, [open, isEditMode, target, form]);

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: ProgramAdmissionConfigFormActionType.Reset });
  }, [form]);

  const totalSeatsUsed = useMemo(
    () =>
      (target?.meritSeatsUsed ?? 0) +
      (target?.catchmentSeatsUsed ?? 0) +
      (target?.eldsSeatsUsed ?? 0),
    [target],
  );

  const programLocked = isEditMode && totalSeatsUsed > 0;

  const programOptions = useMemo(() => {
    const existingProgramIds = new Set(configs.map((config) => config.programId));
    return programs
      .filter((program) => {
        if (isEditMode && target?.programId === program.id) return true;
        return !existingProgramIds.has(program.id);
      })
      .map((program) => ({
        value: program.id,
        label: program.department?.name
          ? `${program.name} (${program.department.name})`
          : program.name,
      }));
  }, [programs, configs, isEditMode, target?.programId]);

  const applyFederalPreset = useCallback(() => {
    form.setFieldsValue({
      meritPercentage: 45,
      catchmentPercentage: 30,
      eldsPercentage: 25,
    });
  }, [form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      dispatch({
        type: ProgramAdmissionConfigFormActionType.SetFormError,
        message: null,
      });

      const quotaError = validateQuotaTotals(values);
      if (quotaError) {
        dispatch({
          type: ProgramAdmissionConfigFormActionType.SetFormError,
          message: quotaError,
        });
        return;
      }

      const cutoffError = validateCutoffOrdering(values);
      if (cutoffError) {
        dispatch({
          type: ProgramAdmissionConfigFormActionType.SetFormError,
          message: cutoffError,
        });
        return;
      }

      const payload = buildPayload(values);

      if (isEditMode && target) {
        await updateConfig({ id: target.id, ...payload }).unwrap();
        notification.success({
          message: "Admission cut-offs and quota updated successfully.",
        });
      } else {
        await createConfig(payload).unwrap();
        notification.success({
          message: "Admission cut-offs and quota created successfully.",
        });
      }

      reset();
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: {
          screen: RequestScreen.Modal,
          method: isEditMode ? "PATCH" : "POST",
        },
        form,
      });
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return {
    state: {
      isEditMode,
      formError: modalState.formError,
      isSubmitting,
      programLocked,
      totalSeatsUsed,
      programOptions,
    },
    actions: {
      handleSubmit,
      handleCancel,
      applyFederalPreset,
    },
    form,
  };
}

export function useDeleteProgramAdmissionConfigModal(
  target: ProgramAdmissionConfig | null,
  onClose: () => void,
) {
  const [deleteConfig, { isLoading: isDeleting }] =
    useDeleteProgramAdmissionConfigMutation();
  const handleApiError = useApiError();

  const totalSeatsUsed =
    (target?.meritSeatsUsed ?? 0) +
    (target?.catchmentSeatsUsed ?? 0) +
    (target?.eldsSeatsUsed ?? 0);
  const blockedByAllocations = totalSeatsUsed > 0;

  const handleConfirm = async () => {
    if (!target || blockedByAllocations) return;
    try {
      await deleteConfig(target.id).unwrap();
      notification.success({
        message: "Admission cut-offs and quota removed successfully.",
      });
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
    state: { isDeleting, blockedByAllocations, totalSeatsUsed },
    actions: { handleConfirm, handleCancel },
  };
}
