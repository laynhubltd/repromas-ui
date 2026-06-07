import { FEE_ITEM_UI_COPY } from "@/shared/constants/feeItemOptions";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
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
  const [, dispatch] = useReducer(feeItemFormReducer, initialFeeItemFormState);

  const [createFeeItem, { isLoading: isCreating }] = useCreateFeeItemMutation();
  const [updateFeeItem, { isLoading: isUpdating }] = useUpdateFeeItemMutation();
  const handleApiError = useApiError();

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
    state: { isEditMode, isSubmitting },
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
  const [suggestDeactivate, setSuggestDeactivate] = useState(false);
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setSuggestDeactivate(false);
      await deleteFeeItem(target.id).unwrap();
      notification.success({ message: FEE_ITEM_UI_COPY.deleteSuccess });
      onClose();
    } catch (err: unknown) {
      const decision = handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "DELETE" },
      });
      if (decision.parsed.status === 409) {
        setSuggestDeactivate(true);
      }
    }
  };

  const handleCancel = () => {
    setSuggestDeactivate(false);
    onClose();
  };

  return {
    state: { isDeleting, suggestDeactivate },
    actions: { handleConfirm, handleCancel },
  };
}
