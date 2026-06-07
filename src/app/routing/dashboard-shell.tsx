import { useAppDispatch } from "@/app/hooks";
import MainLayout from "@/components/layout/MainLayout";
import { useLogoutMutation } from "@/features/auth/api/auth-api";
import { roleSwitcherOpened } from "@/features/auth/state/auth-slice";
import useAuthState from "@/features/auth/use-auth-state";
import { LogoutOutlined, SwapOutlined, UserOutlined } from "@ant-design/icons";
import type { ItemType } from "antd/es/menu/interface";
import { useMemo } from "react";
import { Link, Outlet } from "react-router-dom";
import {
  SetupChecklistLauncher,
  useSetupGatedMenuItems,
} from "@/features/tenant-setup";
import {
  useRestrictedBottomMenuItem,
  useRestrictedRouteMenuItem,
} from "./route-menu-config";

export default function DashboardShell() {
  const restrictedItems = useRestrictedRouteMenuItem();
  const restrictedBottomItems = useRestrictedBottomMenuItem();
  const gatedItems = useSetupGatedMenuItems(restrictedItems);
  const gatedBottomItems = useSetupGatedMenuItems(restrictedBottomItems);
  const { userProfile, roles, activeRole } = useAuthState();
  const dispatch = useAppDispatch();
  const [logout] = useLogoutMutation();

  const onLogout = () => {
    void logout();
  };

  const wrapWithLink = (item: ItemType): ItemType => {
    if (
      item &&
      typeof item === "object" &&
      "key" in item &&
      "label" in item
    ) {
      if ("disabled" in item && item.disabled) {
        return item;
      }
      return {
        ...item,
        label: <Link to={String(item.key)}>{item.label}</Link>,
      };
    }
    return item;
  };

  const menuItems = useMemo<ItemType[]>(
    () => gatedItems.map(wrapWithLink),
    [gatedItems],
  );

  const bottomMenuItems = useMemo<ItemType[]>(
    () => gatedBottomItems.map(wrapWithLink),
    [gatedBottomItems],
  );

  const displayName =
    userProfile?.firstName && userProfile?.lastName
      ? `${userProfile.firstName} ${userProfile.lastName}`
      : (userProfile?.email ?? "User");

  const userMenuItems = useMemo<ItemType[]>(() => {
    const items: ItemType[] = [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: "Profile",
        onClick: () => {},
      },
    ];

    if (roles.length > 1) {
      items.push({
        key: "switch-role",
        icon: <SwapOutlined />,
        label: "Switch Role",
        onClick: () => dispatch(roleSwitcherOpened()),
      });
    }

    items.push({
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: onLogout,
    });

    return items;
  }, [roles, dispatch, onLogout]);

  return (
    <MainLayout
      menuItems={menuItems}
      bottomMenuItems={bottomMenuItems}
      userMenuItems={userMenuItems}
      userDisplayName={displayName}
      userRoleLabel={activeRole?.name}
    >
      <Outlet />
      <SetupChecklistLauncher />
    </MainLayout>
  );
}
