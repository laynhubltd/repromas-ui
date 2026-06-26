import { useAppDispatch } from "@/app/hooks";
import { useThemeColors } from "@/app/theme/useThemeColors";
import MainLayout from "@/components/layout/MainLayout";
import { useLogoutMutation } from "@/features/auth/api/auth-api";
import { roleSwitcherOpened } from "@/features/auth/state/auth-slice";
import useAuthState from "@/features/auth/use-auth-state";
import { useProfilePictureRequired } from "@/features/profile/hooks/useProfilePictureRequired";
import { LogoutOutlined, SwapOutlined, UserOutlined } from "@ant-design/icons";
import type { ItemType } from "antd/es/menu/interface";
import { Tooltip } from "antd";
import { useCallback, useMemo } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { appPaths } from "./app-path";
import {
  toAntdMenuItem,
  useRestrictedStudentRouteMenuItems,
  type StudentRouteMenuItem,
} from "./student-route-menu-config";

export default function StudentShell() {
  const routeMenuItems = useRestrictedStudentRouteMenuItems();
  const colors = useThemeColors();
  const { userProfile, roles, activeRole } = useAuthState();
  const { needsProfilePicture, tooltipMessage } = useProfilePictureRequired();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  const onLogout = () => {
    void logout();
  };

  const wrapWithLink = useCallback(
    (item: StudentRouteMenuItem): ItemType => {
      const antdItem = toAntdMenuItem(item);
      if (
        antdItem &&
        typeof antdItem === "object" &&
        "key" in antdItem &&
        "label" in antdItem
      ) {
        const linkLabel = (
          <Link to={String(antdItem.key)}>{antdItem.label}</Link>
        );

        return {
          ...antdItem,
          title: needsProfilePicture ? tooltipMessage : undefined,
          label: needsProfilePicture ? (
            <Tooltip title={tooltipMessage} placement="right">
              <span style={{ display: "inline-block", width: "100%" }}>
                {linkLabel}
              </span>
            </Tooltip>
          ) : (
            linkLabel
          ),
        } as ItemType;
      }
      return antdItem;
    },
    [needsProfilePicture, tooltipMessage],
  );

  const menuItems = useMemo<ItemType[]>(
    () => routeMenuItems.map((item) => wrapWithLink(item)),
    [routeMenuItems, wrapWithLink],
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
        onClick: () => navigate(appPaths.profile),
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
  }, [roles, dispatch, onLogout, navigate]);

  return (
    <MainLayout
      menuItems={menuItems}
      sidebarBackground={colors.primarySecondary}
      bottomSectionLabel=""
      userMenuItems={userMenuItems}
      userDisplayName={displayName}
      userRoleLabel={activeRole?.name}
      userAvatarUrl={userProfile?.profilePictureUrl}
      userFirstName={userProfile?.firstName}
      userLastName={userProfile?.lastName}
      userEmail={userProfile?.email}
    >
      <Outlet />
    </MainLayout>
  );
}
