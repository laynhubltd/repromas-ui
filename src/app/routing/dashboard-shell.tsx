import MainLayout from "@/components/layout/MainLayout";
import { useLogoutMutation } from "@/features/auth/api/auth-api";
import useAuthState from "@/features/auth/use-auth-state";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import type { ItemType } from "antd/es/menu/interface";
import { useMemo } from "react";
import { Link, Outlet } from "react-router-dom";
import {
    useRestrictedBottomMenuItem,
    useRestrictedRouteMenuItem,
} from "./route-menu-config";

export default function DashboardShell() {
  const restrictedItems = useRestrictedRouteMenuItem();
  const restrictedBottomItems = useRestrictedBottomMenuItem();
  const { userProfile } = useAuthState();
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
      return {
        ...item,
        label: <Link to={String(item.key)}>{item.label}</Link>,
      };
    }
    return item;
  };

  const menuItems = useMemo<ItemType[]>(
    () => restrictedItems.map(wrapWithLink),
    [restrictedItems],
  );

  const bottomMenuItems = useMemo<ItemType[]>(
    () => restrictedBottomItems.map(wrapWithLink),
    [restrictedBottomItems],
  );

  const displayName =
    userProfile?.firstName && userProfile?.lastName
      ? `${userProfile.firstName} ${userProfile.lastName}`
      : (userProfile?.email ?? "User");

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => {},
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: onLogout,
    },
  ];

  return (
    <MainLayout
      menuItems={menuItems}
      bottomMenuItems={bottomMenuItems}
      userMenuItems={userMenuItems}
      userDisplayName={displayName}
    >
      <Outlet />
    </MainLayout>
  );
}
