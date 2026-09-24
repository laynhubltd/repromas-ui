import { Permission } from "@/features/access-control/permissions";
import type { PermissionRequirement } from "@/features/access-control/types";
import { useAccessControl } from "@/features/access-control/use-access-control";
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
  "user-management",
  "approval-workflows",
  "general",
] as const;

const SETUP_TAB_KEYS = [
  "system-config",
  "level-config",
  "curriculum-versions",
  "academic-calendar",
] as const;

export type SettingsTabKey = (typeof ALL_TAB_KEYS)[number];

const TAB_PERMISSION_MAP: Record<SettingsTabKey, PermissionRequirement> = {
  "academic-calendar": [
    Permission.AcademicSessionsList,
    Permission.AcademicSessionsManage,
  ],
  "level-config": [Permission.LevelsList, Permission.LevelsManage],
  "curriculum-versions": [
    Permission.CurriculumVersionsList,
    Permission.CurriculumVersionsManage,
  ],
  "roles-permissions": [
    Permission.RolesList,
    Permission.RolesManage,
    Permission.PermissionsList,
  ],
  "system-timeframe": [
    Permission.SystemTimeFramesList,
    Permission.SystemTimeFramesManage,
  ],
  "system-config": [
    Permission.SystemConfigsList,
    Permission.SystemConfigsManage,
  ],
  "student-transition-status": [
    Permission.StudentTransitionStatusesList,
    Permission.StudentTransitionStatusesManage,
  ],
  "user-management": [
    Permission.UsersList,
    Permission.UsersManage,
    Permission.UserRolesList,
  ],
  "approval-workflows": [
    Permission.WorkflowDefinitionsList,
    Permission.WorkflowDefinitionsManage,
  ],
  general: [Permission.SystemConfigsList, Permission.SystemConfigsManage],
};

export function useSettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { flags } = useSetupStatus();
  const { isPermitted } = useAccessControl();

  const requestedTab = searchParams.get("tab");

  // Dual-dimension gating: Intersect setup phase with user RBAC permissions
  const allowedTabKeys = useMemo(() => {
    const phaseAllowed =
      flags.isSetupComplete || flags.isPhase1Complete
        ? ALL_TAB_KEYS
        : SETUP_TAB_KEYS;

    return phaseAllowed.filter((key) =>
      isPermitted(TAB_PERMISSION_MAP[key as SettingsTabKey]),
    );
  }, [flags.isPhase1Complete, flags.isSetupComplete, isPermitted]);

  const activeKey = useMemo(() => {
    if (
      requestedTab &&
      (allowedTabKeys as readonly string[]).includes(requestedTab)
    ) {
      return requestedTab as SettingsTabKey;
    }
    if ((allowedTabKeys as readonly string[]).includes("roles-permissions")) {
      return "roles-permissions";
    }
    return (allowedTabKeys[0] as SettingsTabKey) ?? "";
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
