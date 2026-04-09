// Feature: rbac-settings
import { applyFormErrors } from "@/shared/utils/error/applyFormErrors";
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
import {
    useCreatePermissionMutation,
    useDeletePermissionMutation,
    useGetPermissionCatalogueQuery,
    useUpdatePermissionMutation,
} from "../api/rbacSettingsApi";
import type { Permission, PermissionCatalogue } from "../types/rbac";

// ─── Upsert (Activate / Edit) ─────────────────────────────────────────────────

export function usePermissionFormModal(
  target: Permission | null,
  open: boolean,
  onClose: () => void,
) {
  const isEditMode = target !== null;
  const [form] = Form.useForm<{ name: string; description?: string }>();
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedCatalogueEntry, setSelectedCatalogueEntry] =
    useState<PermissionCatalogue | null>(null);

  const [createPermission, { isLoading: isCreating }] = useCreatePermissionMutation();
  const [updatePermission, { isLoading: isUpdating }] = useUpdatePermissionMutation();

  const isSubmitting = isCreating || isUpdating;

  // Fetch catalogue only in activate mode
  const { data: catalogueData } = useGetPermissionCatalogueQuery(
    {},
    { skip: isEditMode || !open },
  );
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

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedCatalogueEntry(null);
      setFormError(null);
    }
  }, [open]);

  const handleCatalogueSelect = (entry: PermissionCatalogue) => {
    setSelectedCatalogueEntry(entry);
    form.setFieldsValue({
      name: entry.name,
      description: entry.description ?? undefined,
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setFormError(null);

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
          setFormError("Please select a permission from the catalogue.");
          return;
        }
        await createPermission({
          slug: selectedCatalogueEntry.slug,
          name: values.name.trim(),
          description: values.description?.trim() ?? undefined,
        }).unwrap();
        notification.success({ message: "Permission activated successfully." });
      }

      form.resetFields();
      setSelectedCatalogueEntry(null);
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);

      if (parsed.status === 409) {
        notification.error({ message: parsed.message });
        setFormError("This permission is already activated.");
        return;
      }

      notification.error({ message: parsed.message });
      applyFormErrors(parsed, form, setFormError);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFormError(null);
    setSelectedCatalogueEntry(null);
    onClose();
  };

  return {
    state: { isEditMode, isSubmitting, formError, catalogueEntries },
    actions: { handleSubmit, handleCancel, handleCatalogueSelect },
    form,
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeletePermissionModal(
  target: Permission | null,
  open: boolean,
  onClose: () => void,
) {
  const [deletePermission, { isLoading: isDeleting }] = useDeletePermissionMutation();
  const [error, setError] = useState<string | null>(null);

  // Reset error when modal closes
  useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!target) return;
    try {
      setError(null);
      await deletePermission(target.id).unwrap();
      notification.success({ message: "Permission deleted successfully." });
      onClose();
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      notification.error({ message: parsed.message });
      if (parsed.status === 409) {
        setError("Remove this permission from all roles before deleting it.");
      } else {
        setError(parsed.message);
      }
    }
  };

  const handleCancel = () => {
    setError(null);
    onClose();
  };

  return {
    state: { isDeleting, error },
    actions: { handleConfirm, handleCancel },
  };
}
