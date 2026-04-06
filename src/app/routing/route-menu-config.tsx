import { Permission } from "@/features/access-control/permissions";
import { useAccessControl } from "@/features/access-control/use-access-control";
import {
  ApartmentOutlined,
  DashboardOutlined,
  RadiusSettingOutlined,
  SettingOutlined,
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
    key: appPaths.staffs,
    icon: <UserOutlined />,
    label: "Staffs",
    permission: Permission.RolesList,
  },
  {
    key: appPaths.students,
    icon: <UsergroupAddOutlined />,
    label: "Students",
    permission: Permission.RolesList,
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
    permission: Permission.FacultiesList,
  },
];

/** Bottom sidebar section: config/settings (fixed at bottom, 2026 style). */
export const bottomMenuList: RouteMenuItem[] = [
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
      const perms = Array.isArray(item.permission) ? item.permission : [item.permission];
      return hasAnyPermission(perms);
    });
  }, [hasAnyPermission]);
}

export function useRestrictedBottomMenuItem(): RouteMenuItem[] {
  const { hasAnyPermission } = useAccessControl();
  return useMemo(() => {
    return bottomMenuList.filter((item) => {
      if (!item.permission) return true;
      const perms = Array.isArray(item.permission) ? item.permission : [item.permission];
      return hasAnyPermission(perms);
    });
  }, [hasAnyPermission]);
}
