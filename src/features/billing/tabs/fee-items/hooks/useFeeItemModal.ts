import { FEE_ITEM_UI_COPY } from "@/shared/constants/feeItemOptions";
import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useCallback, useEffect, useReducer, useState } from "react";
import {
  useCreateFeeItemMutation,
  useDeleteFeeItemMutation,
  useUpdateFeeItemMutation,
} from "../api/feeItemApi";
import {
  FeeItemFormActionType,
  feeItemFormReducer,
  initialFeeItemFormState,
} from "../state/feeItemFormState";
import type { FeeItem } from "../types/fee-item";

type FeeItemFormValues = {
  name: string;
  accountingCode?: string;
  description?: string;
  isActive: boolean;
};

export function useFeeItemFormModal(
  target: FeeItem | null,
  open: boolean,
  onClose: () => void,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<FeeItemFormValues>();
  const [modalState, dispatch] = useReducer(
    feeItemFormReducer,
    initialFeeItemFormState,
  );
  const { formError } = modalState;

  const [createFeeItem, { isLoading: isCreating }] = useCreateFeeItemMutation();
  const [updateFeeItem, { isLoading: isUpdating }] = useUpdateFeeItemMutation();

  const isSubmitting = isCreating || isUpdating;

  useEffect(() => {
    if (open && isEditMode && target) {
      form.setFieldsValue({
        name: target.name,
        accountingCode: target.accountingCode ?? undefined,
        description: target.description ?? undefined,
        isActive: target.isActive,
      });
    } else if (open && !isEditMode) {
      form.setFieldsValue({
        name: undefined,
        accountingCode: undefined,
        description: undefined,
        isActive: true,
      });
    }
  }, [open, isEditMode, target, form]);

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: FeeItemFormActionType.Reset });
  }, [form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      dispatch({
        type: FeeItemFormActionType.SetFormError,
        message: null,
      });

      const name = values.name.trim();
      const accountingCode = values.accountingCode?.trim() || null;
      const description = values.description?.trim() || null;
      const isActive = values.isActive;

      if (isEditMode && target) {
        await updateFeeItem({
          id: target.id,
          name,
          accountingCode,
          description,
          isActive,
        }).unwrap();
        notification.success({ message: FEE_ITEM_UI_COPY.updateSuccess });
      } else {
        await createFeeItem({
          name,
          accountingCode,
          description,
          isActive,
        }).unwrap();
        notification.success({ message: FEE_ITEM_UI_COPY.createSuccess });
      }

      reset();
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
      applyFormErrors(parsed, form, (msg) =>
        dispatch({
          type: FeeItemFormActionType.SetFormError,
          message: msg,
        }),
      );
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return {
    state: { isEditMode, formError, isSubmitting },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

export function useDeleteFeeItemModal(
  target: FeeItem | null,
  _open: boolean,
  onClose: () => void,
) {
  const [deleteFeeItem, { isLoading: isDeleting }] = useDeleteFeeItemMutation();
  const [error, setError] = useState<string | null>(null);
  const [suggestDeactivate, setSuggestDeactivate] = useState(false);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      setSuggestDeactivate(false);
      await deleteFeeItem(target.id).unwrap();
      notification.success({ message: FEE_ITEM_UI_COPY.deleteSuccess });
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
      setError(parsed.message);
      if (parsed.status === 409) {
        setSuggestDeactivate(true);
      }
    }
  };

  const handleCancel = () => {
    setError(null);
    setSuggestDeactivate(false);
    onClose();
  };

  return {
    state: { error, isDeleting, suggestDeactivate },
    actions: { handleConfirm, handleCancel },
  };
}
