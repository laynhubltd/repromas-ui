import { useSetupChecklist } from "@/features/tenant-setup/hooks/useSetupChecklist";

export function useDashboard() {
  const setupChecklist = useSetupChecklist();

  return {
    state: {
      setupChecklist: setupChecklist.state,
    },
    actions: {
      handleContinueSetup: setupChecklist.actions.handleContinueSetup,
    },
    flags: {
      showSetupChecklist: setupChecklist.flags.showSetupChecklist,
      showKpis: setupChecklist.flags.showKpis,
    },
  };
}
