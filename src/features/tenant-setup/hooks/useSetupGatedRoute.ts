import { appPaths } from "@/app/routing/app-path";
import { SETUP_STEP_TOOLTIP_BLOCKED } from "@/shared/constants/setupChecklistOptions";
import type { SetupStepId } from "../types/setup";
import { useSetupStatus } from "./useSetupStatus";

export function useSetupGatedRoute(stepId: SetupStepId | undefined) {
  const { actions, flags, state } = useSetupStatus();

  if (!stepId || !flags.shouldGateMenus) {
    return {
      isBlocked: false,
      redirectTo: appPaths.dashboard,
      blockedMessage: null as string | null,
      isLoading: state.isLoading,
    };
  }

  const accessible =
    stepId === "settings"
      ? actions.canAccess("settings")
      : actions.canAccess(stepId);

  return {
    isBlocked: !accessible,
    redirectTo: appPaths.dashboard,
    blockedMessage: accessible ? null : SETUP_STEP_TOOLTIP_BLOCKED[stepId],
    isLoading: state.isLoading,
  };
}
