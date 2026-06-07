import { useSetupStatus } from "@/features/tenant-setup/hooks/useSetupStatus";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

const ALL_TAB_KEYS = [
  "academic-calendar",
  "level-config",
  "curriculum-versions",
  "roles-permissions",
  "system-timeframe",
  "system-config",
  "student-transition-status",
  "general",
] as const;

const SETUP_TAB_KEYS = ["level-config", "curriculum-versions"] as const;

export type SettingsTabKey = (typeof ALL_TAB_KEYS)[number];

export function useSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { flags } = useSetupStatus();

  const requestedTab = searchParams.get("tab");

  const allowedTabKeys = useMemo(() => {
    if (flags.isSetupComplete || flags.isPhase1Complete) {
      return ALL_TAB_KEYS;
    }
    return SETUP_TAB_KEYS;
  }, [flags.isPhase1Complete, flags.isSetupComplete]);

  const activeKey = useMemo(() => {
    if (
      requestedTab &&
      (allowedTabKeys as readonly string[]).includes(requestedTab)
    ) {
      return requestedTab as SettingsTabKey;
    }
    if ((allowedTabKeys as readonly string[]).includes("level-config")) {
      return "level-config";
    }
    return allowedTabKeys[0] ?? "curriculum-versions";
  }, [requestedTab, allowedTabKeys]);

  const handleTabChange = useCallback(
    (key: string) => {
      setSearchParams({ tab: key }, { replace: true });
    },
    [setSearchParams],
  );

  return {
    state: {
      activeKey,
      allowedTabKeys,
    },
    actions: {
      handleTabChange,
    },
    flags: {
      restrictToSetupTabs: !flags.isPhase1Complete && !flags.isSetupComplete,
    },
  };
}
