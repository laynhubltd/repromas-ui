import { Permission } from "@/features/access-control/permissions";
import { useAccessControl } from "@/features/access-control/use-access-control";
import {
  ApartmentOutlined,
  AuditOutlined,
  BookOutlined,
  DashboardOutlined,
  DollarOutlined,
  FileTextOutlined,
  FormOutlined,
  RadiusSettingOutlined,
  SettingOutlined,
  SolutionOutlined,
  TrophyOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
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
    icon: <DashboardOutlined />,
    label: "Dashboard",
  },
  {
    key: appPaths.staff,
    icon: <UserOutlined />,
    label: "Staff",
    permission: Permission.StaffList,
    setupStepId: "staff",
  },
  {
    key: appPaths.students,
    icon: <UsergroupAddOutlined />,
    label: "Students",
    permission: Permission.StudentsList,
    setupStepId: "student",
  },
  {
    key: appPaths.admissionCandidates,
    icon: <SolutionOutlined />,
    label: "Admission Candidates",
    permission: Permission.AdmissionCandidatesList,
    setupStepId: "admissionCandidate",
  },
  {
    key: appPaths.academicStructure,
    icon: <ApartmentOutlined />,
    label: "Faculty & Departments",
    permission: Permission.FacultiesList,
    setupStepId: "department",
  },
  {
    key: appPaths.program,
    icon: <RadiusSettingOutlined />,
    label: "Program",
    permission: Permission.ProgramsList,
    setupStepId: "program",
  },
  {
    key: appPaths.courses,
    icon: <BookOutlined />,
    label: "Courses",
    permission: Permission.CoursesList,
    setupStepId: "course",
  },
  {
    key: appPaths.courseRegistration,
    icon: <FormOutlined />,
    label: "Course Registration",
    permission: Permission.StudentCourseRegistrationsManage,
    setupStepId: "courseRegistration",
  },
  {
    key: appPaths.assessment,
    icon: <FileTextOutlined />,
    label: "Assessment",
    permission: Permission.StudentScoreSheetsList,
    setupStepId: "assessment",
  },
  {
    key: appPaths.billing,
    icon: <DollarOutlined />,
    label: "Billing",
    permission: Permission.BillingBillableEventsList,
    setupStepId: "billing",
  },
];

/** Bottom sidebar section: config/settings (fixed at bottom, 2026 style). */
export const bottomMenuList: RouteMenuItem[] = [
  {
    key: appPaths.gradingConfig,
    icon: <TrophyOutlined />,
    label: "Grading Config",
    permission: Permission.GradingSchemaConfigsList,
    setupStepId: "gradingConfig",
  },
  {
    key: appPaths.admissionConfig,
    icon: <AuditOutlined />,
    label: "Admission Config",
    permission: Permission.SystemConfigsList,
    setupStepId: "admissionConfig",
  },
  {
    key: appPaths.settings,
    icon: <SettingOutlined />,
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
