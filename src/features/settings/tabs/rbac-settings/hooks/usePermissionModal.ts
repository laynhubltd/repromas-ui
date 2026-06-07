// Feature: rbac-settings
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { Form, notification } from "antd";
import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  useCreatePermissionMutation,
  useDeletePermissionMutation,
  useGetPermissionCatalogueQuery,
  useUpdatePermissionMutation,
} from "../api/rbacSettingsApi";
import {
  initialPermissionFormState,
  PermissionFormActionType,
  permissionFormReducer,
} from "../state/permissionFormState";
import type { Permission, PermissionCatalogue } from "../types/rbac";

// ─── Upsert (Activate / Edit) ─────────────────────────────────────────────────

export function usePermissionFormModal(
  target: Permission | null,
  open: boolean,
  onClose: () => void,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<{ name: string; description?: string }>();
  const [modalState, dispatch] = useReducer(
    permissionFormReducer,
    initialPermissionFormState,
  );
  const {
    formError,
    selectedCatalogueEntry,
    catalogueSearch,
    debouncedCatalogueSearch,
  } = modalState;
  const handleApiError = useApiError();

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [createPermission, { isLoading: isCreating }] =
    useCreatePermissionMutation();
  const [updatePermission, { isLoading: isUpdating }] =
    useUpdatePermissionMutation();

  const isSubmitting = isCreating || isUpdating;

  // Debounced search handler
  const handleCatalogueSearchChange = useCallback((value: string) => {
    dispatch({ type: PermissionFormActionType.SetCatalogueSearch, value });
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      dispatch({
        type: PermissionFormActionType.SetCatalogueSearchDebounced,
        value,
      });
    }, 300);
  }, []);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // Fetch catalogue only in activate mode with server-side search
  const catalogueQueryParams = debouncedCatalogueSearch
    ? { "search[slug]": debouncedCatalogueSearch }
    : {};

  const { data: catalogueData, isLoading: isCatalogueLoading } =
    useGetPermissionCatalogueQuery(catalogueQueryParams, {
      skip: isEditMode || !open,
    });
  const catalogueEntries = catalogueData?.member ?? [];

  // Pre-fill form in edit mode
  useEffect(() => {
    if (open && isEditMode && target) {
      form.setFieldsValue({
        name: target.name,
        description: target.description ?? undefined,
      });
    }
  }, [open, isEditMode, target, form]);

  const reset = useCallback(() => {
    form.resetFields();
    dispatch({ type: PermissionFormActionType.Reset });
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  }, [form]);

  const handleCatalogueSelect = (entry: PermissionCatalogue) => {
    dispatch({ type: PermissionFormActionType.SelectCatalogueEntry, entry });
    form.setFieldsValue({
      name: entry.name,
      description: entry.description ?? undefined,
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      dispatch({ type: PermissionFormActionType.SetFormError, message: null });

      if (isEditMode) {
        await updatePermission({
          id: target.id,
          name: values.name.trim(),
          slug: target.slug,
          description: values.description?.trim() ?? undefined,
        }).unwrap();
        notification.success({ message: "Permission updated successfully." });
      } else {
        if (!selectedCatalogueEntry) {
          dispatch({
            type: PermissionFormActionType.SetFormError,
            message: "Please select a permission from the catalogue.",
          });
          return;
        }
        await createPermission({
          slug: selectedCatalogueEntry.slug,
          name: values.name.trim(),
          description: values.description?.trim() ?? undefined,
        }).unwrap();
        notification.success({ message: "Permission activated successfully." });
      }

      reset();
      onClose();
    } catch (err: unknown) {
      const decision = handleApiError(err, {
        context: {
          screen: RequestScreen.Modal,
          method: isEditMode ? "PATCH" : "POST",
        },
        form,
      });
      if (isEditMode && decision.disableForm) {
        onClose();
      }
    }
  };

  const handleCancel = () => {
    reset();
    onClose();
  };

  return {
    state: {
      isEditMode,
      isSubmitting,
      formError,
      catalogueEntries,
      isCatalogueLoading,
      catalogueSearch,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleCatalogueSelect,
      handleCatalogueSearchChange,
    },
    form,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeletePermissionModal(
  target: Permission | null,
  _open: boolean,
  onClose: () => void,
) {
  const [deletePermission, { isLoading: isDeleting }] =
    useDeletePermissionMutation();
  const handleApiError = useApiError();

  const handleConfirm = async () => {
    if (!target) return;
    try {
      await deletePermission(target.id).unwrap();
      notification.success({ message: "Permission deleted successfully." });
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
    state: { isDeleting },
    actions: { handleConfirm, handleCancel },
  };
}
