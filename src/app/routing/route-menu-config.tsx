import { Permission } from "@/features/access-control/permissions";
import { useAccessControl } from "@/features/access-control/use-access-control";
import { AppIcon } from "@/shared/ui/AppIcon";
import type { ItemType } from "antd/es/menu/interface";
import { useMemo } from "react";
import type { SetupStepId } from "@/features/tenant-setup/types/setup";
import { appPaths } from "./app-path";

export type RouteMenuItem = ItemType & {
  permission?: Permission | Permission[];
  setupStepId?: SetupStepId;
};

/** Main navigation items (top of sidebar). */
export const routesMenuList: RouteMenuItem[] = [
  {
    key: appPaths.dashboard,
    icon: <AppIcon name="dashboard" size="md" />,
    label: "Dashboard",
  },
  {
    key: appPaths.staff,
    icon: <AppIcon name="user-account" size="md" />,
    label: "Staff",
    permission: Permission.StaffList,
    setupStepId: "staff",
  },
  {
    key: appPaths.students,
    icon: <AppIcon name="mortarboard-2" size="md" />,
    label: "Students",
    permission: Permission.StudentsList,
    setupStepId: "student",
  },
  {
    key: appPaths.admissionCandidates,
    icon: <AppIcon name="user-check" size="md" />,
    label: "Admission Candidates",
    permission: Permission.AdmissionCandidatesList,
    setupStepId: "admissionCandidate",
  },
  {
    key: appPaths.academicStructure,
    icon: <AppIcon name="building" size="md" />,
    label: "Faculty & Departments",
    permission: Permission.FacultiesList,
    setupStepId: "department",
  },
  {
    key: appPaths.program,
    icon: <AppIcon name="folder-library" size="md" />,
    label: "Program",
    permission: Permission.ProgramsList,
    setupStepId: "program",
  },
  {
    key: appPaths.courses,
    icon: <AppIcon name="book-bookmark" size="md" />,
    label: "Courses",
    permission: Permission.CoursesList,
    setupStepId: "course",
  },
  {
    key: appPaths.courseRegistration,
    icon: <AppIcon name="task" size="md" />,
    label: "Course Registration",
    permission: Permission.StudentCourseRegistrationsManage,
    setupStepId: "courseRegistration",
  },
  {
    key: appPaths.assessment,
    icon: <AppIcon name="checkmark-badge" size="md" />,
    label: "Assessment",
    permission: Permission.StudentScoreSheetsList,
    setupStepId: "assessment",
  },
  {
    key: appPaths.billing,
    icon: <AppIcon name="coins" size="md" />,
    label: "Billing",
    permission: Permission.BillingBillableEventsList,
    setupStepId: "billing",
  },
];

/** Bottom sidebar section: config/settings (fixed at bottom, 2026 style). */
export const bottomMenuList: RouteMenuItem[] = [
  {
    key: appPaths.gradingConfig,
    icon: <AppIcon name="award" size="md" />,
    label: "Grading Config",
    permission: Permission.GradingSchemaConfigsList,
    setupStepId: "gradingConfig",
  },
  {
    key: appPaths.admissionConfig,
    icon: <AppIcon name="preferences" size="md" />,
    label: "Admission Config",
    permission: Permission.SystemConfigsList,
    setupStepId: "admissionConfig",
  },
  {
    key: appPaths.settings,
    icon: <AppIcon name="preferences" size="md" />,
    label: "Settings",
    permission: Permission.SystemConfigsList,
    setupStepId: "settings",
  },
];

export function useRestrictedRouteMenuItem(): RouteMenuItem[] {
  const { hasAnyPermission } = useAccessControl();
  return useMemo(() => {
    return routesMenuList.filter((item) => {
      if (!item.permission) return true;
      const perms = Array.isArray(item.permission)
        ? item.permission
        : [item.permission];
      return hasAnyPermission(perms);
    });
  }, [hasAnyPermission]);
}

export function useRestrictedBottomMenuItem(): RouteMenuItem[] {
  const { hasAnyPermission } = useAccessControl();
  return useMemo(() => {
    return bottomMenuList.filter((item) => {
      if (!item.permission) return true;
      const perms = Array.isArray(item.permission)
        ? item.permission
        : [item.permission];
      return hasAnyPermission(perms);
    });
  }, [hasAnyPermission]);
}
