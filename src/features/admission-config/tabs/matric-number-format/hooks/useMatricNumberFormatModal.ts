import { useApiError } from "@/shared/hooks/useApiError";
import { MATRIC_NUMBER_FORMAT_UI_COPY, MATRIC_DEFAULT_SLOT_KEY } from "@/shared/constants/matricNumberFormatOptions";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import {
  useActivateMatricNumberFormatMutation,
  useCreateMatricNumberFormatMutation,
  useDeactivateMatricNumberFormatMutation,
  useDuplicateMatricNumberFormatMutation,
  useReactivateMatricNumberFormatMutation,
} from "../api/matricNumberFormatApi";
import type { MatricFormatSlot, MatricNumberFormat } from "../types/matric-number-format";

const DEFAULT_TEMPLATE = "{sessionUpperYYYY}/REG/{seq:6}";

// ─── Create draft ─────────────────────────────────────────────────────────────

export function useCreateMatricNumberFormatModal(
  open: boolean,
  initialEntryMode: MatricFormatSlot | undefined,
  lanePresetLocked: boolean,
  onClose: () => void,
  onCreated: (format: MatricNumberFormat) => void,
) {
  const [form] = Form.useForm();
  const [createFormat, { isLoading }] = useCreateMatricNumberFormatMutation();
  const handleApiError = useApiError();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const entryMode: MatricFormatSlot =
        values.entryMode === MATRIC_DEFAULT_SLOT_KEY ? null : values.entryMode;
      const result = await createFormat({
        code: values.code.trim(),
        entryMode,
        template: DEFAULT_TEMPLATE,
        tokenOptions: {},
        counterPartition: "TENANT",
        sequencePadding: 6,
        initialValue: 1,
      }).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Matric number format", "created"));
      form.resetFields();
      onClose();
      onCreated(result);
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Modal, method: "POST" },
        form,
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const defaultEntryModeKey =
    initialEntryMode === undefined || initialEntryMode === null
      ? MATRIC_DEFAULT_SLOT_KEY
      : initialEntryMode;

  return {
    state: { isLoading, lanePresetLocked, defaultEntryModeKey, open },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

// ─── Duplicate ────────────────────────────────────────────────────────────────

export function useDuplicateMatricNumberFormatModal(
  target: MatricNumberFormat | null,
  _open: boolean,
  onClose: () => void,
  onDuplicated: (format: MatricNumberFormat) => void,
) {
  const [form] = Form.useForm();
  const [duplicateFormat, { isLoading }] = useDuplicateMatricNumberFormatMutation();
  const handleApiError = useApiError();

  const handleSubmit = async () => {
    if (!target) return;
    try {
      const values = await form.validateFields();
      const result = await duplicateFormat({
        id: target.id,
        code: values.code.trim(),
      }).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Matric number format", "created"));
      form.resetFields();
      onClose();
      onDuplicated(result);
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Modal, method: "POST" },
        form,
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return {
    state: { isLoading },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

// ─── Activate ─────────────────────────────────────────────────────────────────

export function useActivateMatricNumberFormatModal(
  target: MatricNumberFormat | null,
  activeFormat: MatricNumberFormat | null,
  onClose: () => void,
) {
  const [activateFormat, { isLoading }] = useActivateMatricNumberFormatMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target || target.status !== "DRAFT") return;
    try {
      await activateFormat(target.id).unwrap();
      notifyMutationSuccess("Matric number format activated successfully.");
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return {
    state: { isLoading, activeFormat },
    actions: { handleConfirm, handleCancel },
  };
}

// ─── Deactivate ───────────────────────────────────────────────────────────────

export function useDeactivateMatricNumberFormatModal(
  target: MatricNumberFormat | null,
  onClose: () => void,
) {
  const [deactivateFormat, { isLoading }] = useDeactivateMatricNumberFormatMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deactivateFormat(target.id).unwrap();
      notifyMutationSuccess(MATRIC_NUMBER_FORMAT_UI_COPY.deactivateSuccess);
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return {
    state: { isLoading },
    actions: { handleConfirm, handleCancel },
  };
}

// ─── Reactivate (INACTIVE only) ───────────────────────────────────────────────

export function useReactivateMatricNumberFormatModal(
  target: MatricNumberFormat | null,
  onClose: () => void,
) {
  const [reactivateFormat, { isLoading }] = useReactivateMatricNumberFormatMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target || target.status !== "INACTIVE") return;
    try {
      await reactivateFormat(target.id).unwrap();
      notifyMutationSuccess(MATRIC_NUMBER_FORMAT_UI_COPY.reactivateSuccess);
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return {
    state: { isLoading },
    actions: { handleConfirm, handleCancel },
  };
}
