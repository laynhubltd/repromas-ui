import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useCallback, useEffect, useReducer } from "react";
import {
  useCreateDocumentTypeMutation,
  useDeleteDocumentTypeMutation,
  useUpdateDocumentTypeMutation,
} from "../api/documentTypeApi";
import {
  DocumentTypeFormActionType,
  documentTypeFormReducer,
  initialDocumentTypeFormState,
} from "../state/documentTypeFormState";
import type { AdmissionDocumentType } from "../types/document-type";

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

type DocumentTypeFormValues = {
  code: string;
  name: string;
  description?: string | null;
  mimeTypes: string[];
  maxSizeMb: number;
  isRequired: boolean;
  isActive: boolean;
};

export function useDocumentTypeFormModal(
  target: AdmissionDocumentType | null,
  open: boolean,
  onClose: () => void,
) {
  const [formState, dispatch] = useReducer(
    documentTypeFormReducer,
    initialDocumentTypeFormState,
  );
  const [form] = Form.useForm<DocumentTypeFormValues>();
  const handleApiError = useApiError();

  const isEditMode = target !== null;

  const [createDocumentType, { isLoading: isCreating }] =
    useCreateDocumentTypeMutation();
  const [updateDocumentType, { isLoading: isUpdating }] =
    useUpdateDocumentTypeMutation();

  const isSubmitting = isCreating || isUpdating;

  // Pre-fill form in edit mode when modal opens
  useEffect(() => {
    if (open && isEditMode && target) {
      form.setFieldsValue({
        name: target.name,
        description: target.description ?? undefined,
        mimeTypes: target.mimeTypes,
        maxSizeMb: target.maxSizeMb,
        isRequired: target.isRequired,
        isActive: target.isActive,
      });
    }
  }, [open, isEditMode, target, form]);

  const reset = useCallback(() => {
    dispatch({ type: DocumentTypeFormActionType.Reset });
    form.resetFields();
  }, [form]);

  const handleSubmit = useCallback(
    async (values: DocumentTypeFormValues) => {
      try {
        if (isEditMode && target) {
          await updateDocumentType({
            id: target.id,
            name: values.name,
            description: values.description ?? null,
            mimeTypes: values.mimeTypes,
            maxSizeMb: values.maxSizeMb,
            isRequired: values.isRequired,
            isActive: values.isActive,   // always sent on PUT
          }).unwrap();
          notifyMutationSuccess(mutationSuccessMessage("Document Type", "updated"));
        } else {
          await createDocumentType({
            code: values.code,
            name: values.name,
            description: values.description ?? null,
            mimeTypes: values.mimeTypes,
            maxSizeMb: values.maxSizeMb,
            isRequired: values.isRequired,
            // isActive intentionally omitted — always true on POST
          }).unwrap();
          notifyMutationSuccess(mutationSuccessMessage("Document Type", "created"));
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
    },
    [
      isEditMode,
      target,
      createDocumentType,
      updateDocumentType,
      reset,
      onClose,
      handleApiError,
      form,
    ],
  );

  const handleCancel = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  // Auto-suggest code from name in create mode
  const handleNameChange = useCallback(
    (name: string) => {
      if (!isEditMode) {
        const suggested = name
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "")
          .replace(/^_+/, "");
        // Only auto-fill if user hasn't manually typed a code yet
        const currentCode = form.getFieldValue("code") as string | undefined;
        const prevSuggested = (form.getFieldValue("name") as string | undefined)
          ?.toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "")
          .replace(/^_+/, "");
        if (!currentCode || currentCode === prevSuggested) {
          form.setFieldsValue({ code: suggested });
        }
      }
    },
    [isEditMode, form],
  );

  return {
    state: {
      isEditMode,
      formError: formState.formError,
      isSubmitting,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleNameChange,
    },
    form,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteDocumentTypeModal(
  target: AdmissionDocumentType | null,
  onClose: () => void,
) {
  const [deleteDocumentType, { isLoading: isDeleting }] =
    useDeleteDocumentTypeMutation();
  const handleApiError = useApiError();

  const handleConfirm = useCallback(async () => {
    if (!target) return;
    try {
      await deleteDocumentType(target.id).unwrap();
      notifyMutationSuccess(mutationSuccessMessage("Document Type", "deleted"));
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "DELETE" },
      });
    }
  }, [target, deleteDocumentType, onClose, handleApiError]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  return {
    state: { isDeleting },
    actions: { handleConfirm, handleCancel },
  };
}
