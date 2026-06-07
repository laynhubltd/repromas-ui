import { useAppDispatch, useAppSelector } from "@/app/hooks";
import useAuthState from "@/features/auth/use-auth-state";
import { useCallback, useEffect } from "react";
import {
  setupPanelClosed,
  setupPanelDismissed,
  setupPanelOpened,
} from "../state/setupUiSlice";
import {
  readSetupPanelDismissed,
  writeSetupPanelDismissed,
} from "../state/setupUiState";
import { useSetupStatus } from "./useSetupStatus";

export function useSetupUi() {
  const dispatch = useAppDispatch();
  const setupUi = useAppSelector((state) => state.setupUi);
  const { tenantId } = useAuthState();
  const { flags } = useSetupStatus();

  const tenantKey = tenantId != null ? String(tenantId) : "unknown";

  useEffect(() => {
    if (readSetupPanelDismissed(tenantKey)) {
      dispatch(setupPanelDismissed());
    }
  }, [dispatch, tenantKey]);

  const openPanel = useCallback(() => {
    writeSetupPanelDismissed(tenantKey, false);
    dispatch(setupPanelOpened());
  }, [dispatch, tenantKey]);

  const closePanel = useCallback(() => {
    dispatch(setupPanelClosed());
  }, [dispatch]);

  const dismissPanel = useCallback(() => {
    writeSetupPanelDismissed(tenantKey, true);
    dispatch(setupPanelDismissed());
  }, [dispatch, tenantKey]);

  return {
    state: {
      isPanelOpen: setupUi.isPanelOpen,
      isPanelDismissed: setupUi.isPanelDismissed,
    },
    actions: {
      openPanel,
      closePanel,
      dismissPanel,
    },
    flags: {
      showLauncher: flags.shouldGateMenus && !setupUi.isPanelDismissed,
    },
  };
}
