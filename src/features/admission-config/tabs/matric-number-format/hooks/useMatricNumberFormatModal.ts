import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import {
  useActivateMatricNumberFormatMutation,
  useCreateMatricNumberFormatMutation,
  useDuplicateMatricNumberFormatMutation,
} from "../api/matricNumberFormatApi";
import type { MatricNumberFormat } from "../types/matric-number-format";

const DEFAULT_TEMPLATE = "{sessionUpperYYYY}/REG/{seq:6}";

// ─── Create draft ─────────────────────────────────────────────────────────────

export function useCreateMatricNumberFormatModal(
  _open: boolean,
  onClose: () => void,
  onCreated: (format: MatricNumberFormat) => void,
) {
  const [form] = Form.useForm();
  const [createFormat, { isLoading }] = useCreateMatricNumberFormatMutation();
  const handleApiError = useApiError();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const result = await createFormat({
        code: values.code.trim(),
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

  return {
    state: { isLoading },
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
    if (!target) return;
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
