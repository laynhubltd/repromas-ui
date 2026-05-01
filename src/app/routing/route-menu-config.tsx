import { Permission } from "@/features/access-control/permissions";
import { useAccessControl } from "@/features/access-control/use-access-control";
import {
  ApartmentOutlined,
  BookOutlined,
  DashboardOutlined,
  FormOutlined,
  RadiusSettingOutlined,
  SettingOutlined,
  TrophyOutlined,
  UsergroupAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ItemType } from "antd/es/menu/interface";
import { useMemo } from "react";
import { appPaths } from "./app-path";

export type RouteMenuItem = ItemType & {
  permission?: Permission | Permission[];
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
  },
  {
    key: appPaths.students,
    icon: <UsergroupAddOutlined />,
    label: "Students",
    permission: Permission.StudentsList,
  },
  {
    key: appPaths.academicStructure,
    icon: <ApartmentOutlined />,
    label: "Faculty & Departments",
    permission: Permission.FacultiesList,
  },
  {
    key: appPaths.program,
    icon: <RadiusSettingOutlined />,
    label: "Program",
    permission: Permission.ProgramsList,
  },
  {
    key: appPaths.courses,
    icon: <BookOutlined />,
    label: "Courses",
    permission: Permission.CoursesList,
  },
  {
    key: appPaths.courseRegistration,
    icon: <FormOutlined />,
    label: "Course Registration",
    permission: Permission.StudentCourseRegistrationsManage,
  },
];

/** Bottom sidebar section: config/settings (fixed at bottom, 2026 style). */
export const bottomMenuList: RouteMenuItem[] = [
  {
    key: appPaths.gradingConfig,
    icon: <TrophyOutlined />,
    label: "Grading Config",
    permission: Permission.GradingSchemaConfigsList,
  },
  {
    key: appPaths.settings,
    icon: <SettingOutlined />,
    label: "Settings",
    permission: Permission.SystemConfigsList,
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
