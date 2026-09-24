import {
  filterPermittedMenuItems,
  routePrivilegeMatrix,
  useAccessControl,
  type PermissionRequirement,
} from "@/features/access-control";
import { useInstitutionTerminology } from "@/shared/hooks/useInstitutionTerminology";
import { AppIcon } from "@/shared/ui/AppIcon";
import type { ItemType } from "antd/es/menu/interface";
import { useMemo } from "react";
import type { SetupStepId } from "@/features/tenant-setup/types/setup";
import { appPaths } from "./app-path";

export type RouteMenuItem = ItemType & {
  permission?: PermissionRequirement;
  setupStepId?: SetupStepId;
};

/** Main navigation items (top of sidebar). Derived from routePrivilegeMatrix. */
export const routesMenuList: RouteMenuItem[] = [
  {
    key: appPaths.dashboard,
    icon: <AppIcon name="dashboard" size="md" />,
    label: "Dashboard",
    permission: routePrivilegeMatrix[appPaths.dashboard],
  },
  {
    key: appPaths.staff,
    icon: <AppIcon name="user-account" size="md" />,
    label: "Staff",
    permission: routePrivilegeMatrix[appPaths.staff],
    setupStepId: "staff",
  },
  {
    key: appPaths.students,
    icon: <AppIcon name="mortarboard-2" size="md" />,
    label: "Students",
    permission: routePrivilegeMatrix[appPaths.students],
    setupStepId: "student",
  },
  {
    key: appPaths.admissionCandidates,
    icon: <AppIcon name="user-check" size="md" />,
    label: "Admission Candidates",
    permission: routePrivilegeMatrix[appPaths.admissionCandidates],
    setupStepId: "admissionCandidate",
  },
  {
    key: appPaths.academicStructure,
    icon: <AppIcon name="building" size="md" />,
    label: "Faculty & Departments",
    permission: routePrivilegeMatrix[appPaths.academicStructure],
    setupStepId: "department",
  },
  {
    key: appPaths.program,
    icon: <AppIcon name="folder-library" size="md" />,
    label: "Program",
    permission: routePrivilegeMatrix[appPaths.program],
    setupStepId: "program",
  },
  {
    key: appPaths.courses,
    icon: <AppIcon name="book-bookmark" size="md" />,
    label: "Courses",
    permission: routePrivilegeMatrix[appPaths.courses],
    setupStepId: "course",
  },
  {
    key: appPaths.courseRegistration,
    icon: <AppIcon name="task" size="md" />,
    label: "Course Registration",
    permission: routePrivilegeMatrix[appPaths.courseRegistration],
    setupStepId: "courseRegistration",
  },
  {
    key: appPaths.assessment,
    icon: <AppIcon name="checkmark-badge" size="md" />,
    label: "Assessment",
    permission: routePrivilegeMatrix[appPaths.assessment],
    setupStepId: "assessment",
  },
  {
    key: appPaths.resultBroadsheet,
    icon: <AppIcon name="award" size="md" />,
    label: "Result Broadsheet",
    permission: routePrivilegeMatrix[appPaths.resultBroadsheet],
  },
  {
    key: appPaths.studentTransitions,
    icon: <AppIcon name="task" size="md" />,
    label: "Student Transitions",
    permission: routePrivilegeMatrix[appPaths.studentTransitions],
  },
  {
    key: appPaths.billing,
    icon: <AppIcon name="coins" size="md" />,
    label: "Billing",
    permission: routePrivilegeMatrix[appPaths.billing],
    setupStepId: "billing",
  },
];

/** Bottom sidebar section: config/settings (fixed at bottom). Derived from routePrivilegeMatrix. */
export const bottomMenuList: RouteMenuItem[] = [
  {
    key: appPaths.gradingConfig,
    icon: <AppIcon name="award" size="md" />,
    label: "Grading Config",
    permission: routePrivilegeMatrix[appPaths.gradingConfig],
    setupStepId: "gradingConfig",
  },
  {
    key: appPaths.admissionConfig,
    icon: <AppIcon name="preferences" size="md" />,
    label: "Admission Config",
    permission: routePrivilegeMatrix[appPaths.admissionConfig],
    setupStepId: "admissionConfig",
  },
  {
    key: appPaths.settings,
    icon: <AppIcon name="preferences" size="md" />,
    label: "Settings",
    permission: routePrivilegeMatrix[appPaths.settings],
    setupStepId: "settings",
  },
];

export function useRestrictedRouteMenuItem(): RouteMenuItem[] {
  const { isPermitted } = useAccessControl();
  const { academicUnit } = useInstitutionTerminology();

  return useMemo(() => {
    const permittedItems = filterPermittedMenuItems(
      routesMenuList,
      isPermitted,
    ) as RouteMenuItem[];

    return permittedItems.map((item) => {
      if (item.key === appPaths.academicStructure) {
        return {
          ...item,
          label: academicUnit.combinedMenuLabel,
        };
      }
      return item;
    });
  }, [isPermitted, academicUnit.combinedMenuLabel]);
}

export function useRestrictedBottomMenuItem(): RouteMenuItem[] {
  const { isPermitted } = useAccessControl();
  return useMemo(() => {
    return filterPermittedMenuItems(
      bottomMenuList,
      isPermitted,
    ) as RouteMenuItem[];
  }, [isPermitted]);
}
