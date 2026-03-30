import { Privilege } from "@/features/access-control/privileges-enum";
import { useAccessControl } from "@/features/access-control/use-access-control";
import {
  ApartmentOutlined,
  DashboardOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ItemType } from "antd/es/menu/interface";
import { useMemo } from "react";
import { appPaths } from "./app-path";

export type RouteMenuItem = ItemType & {
  privilege?: Privilege | Privilege[];
};

/** Main navigation items (top of sidebar). */
export const routesMenuList: RouteMenuItem[] = [
  {
    key: appPaths.dashboard,
    icon: <DashboardOutlined />,
    label: "Dashboard",
    privilege: Privilege.DashboardRead,
  },
  {
    key: appPaths.staffs,
    icon: <UserOutlined />,
    label: "Staffs",
    privilege: Privilege.DashboardRead,
  },
  {
    key: appPaths.academicStructure,
    icon: <ApartmentOutlined />,
    label: "Faculty & Programs",
    privilege: Privilege.DashboardRead,
  },
];

/** Bottom sidebar section: config/settings (fixed at bottom, 2026 style). */
export const bottomMenuList: RouteMenuItem[] = [
  {
    key: appPaths.settings,
    icon: <SettingOutlined />,
    label: "Settings",
    privilege: Privilege.DashboardRead,
  },
];

export function useRestrictedRouteMenuItem(): RouteMenuItem[] {
  const { hasPrivilege } = useAccessControl();
  return useMemo(() => {
    return routesMenuList.filter((item) => {
      if (!item.privilege) return true;
      return hasPrivilege(item.privilege) ?? true; // TODO: allow access for now before we have the privilege matrix
    });
  }, [hasPrivilege]);
}

export function useRestrictedBottomMenuItem(): RouteMenuItem[] {
  const { hasPrivilege } = useAccessControl();
  return useMemo(() => {
    return bottomMenuList.filter((item) => {
      if (!item.privilege) return true;
      return hasPrivilege(item.privilege) ?? true;
    });
  }, [hasPrivilege]);
}
