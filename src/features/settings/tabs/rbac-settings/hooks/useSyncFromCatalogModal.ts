// Feature: rbac-settings
import { parseApiError } from "@/shared/utils/error/parseApiError";
import { notification } from "antd";
import { useCallback, useReducer } from "react";
import { useSyncPermissionsFromCatalogMutation } from "../api/rbacSettingsApi";
import {
  initialSyncFromCatalogState,
  SyncFromCatalogActionType,
  syncFromCatalogReducer,
} from "../state/syncFromCatalogState";

export function useSyncFromCatalogModal(onClose: () => void) {
  const [state, dispatch] = useReducer(
    syncFromCatalogReducer,
    initialSyncFromCatalogState,
  );
  const { step, assignToSystemAdministrator, lastResult, error } = state;

  const [syncPermissionsFromCatalog, { isLoading: isSyncing }] =
    useSyncPermissionsFromCatalogMutation();

  const reset = useCallback(() => {
    dispatch({ type: SyncFromCatalogActionType.Reset });
  }, []);

  const handleCancel = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleConfirm = useCallback(async () => {
    dispatch({ type: SyncFromCatalogActionType.SetError, message: null });

    try {
      const result = await syncPermissionsFromCatalog({
        skipExistingTenantPermissions: true,
        assignToSystemAdministrator,
      }).unwrap();

      dispatch({ type: SyncFromCatalogActionType.SetLastResult, result });

      notification.success({
        message: "Permissions synced from catalogue",
        description: `${result.tenantPermissionsCreatedCount} tenant permission(s) created, ${result.assignedToSystemAdministratorCount} assigned to System Administrator.`,
      });
    } catch (err: unknown) {
      const parsed = parseApiError(err);
      dispatch({ type: SyncFromCatalogActionType.SetError, message: parsed.message });
      notification.error({ message: parsed.message });
    }
  }, [syncPermissionsFromCatalog, assignToSystemAdministrator]);

  const handleDone = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const setAssignToSystemAdministrator = useCallback((value: boolean) => {
    dispatch({
      type: SyncFromCatalogActionType.SetAssignToSystemAdministrator,
      value,
    });
  }, []);

  return {
    state: {
      step,
      assignToSystemAdministrator,
      lastResult,
      error,
      isSyncing,
    },
    actions: {
      handleConfirm,
      handleCancel,
      handleDone,
      setAssignToSystemAdministrator,
    },
    flags: {
      isConfirmStep: step === "confirm",
      isResultsStep: step === "results",
    },
  };
}
