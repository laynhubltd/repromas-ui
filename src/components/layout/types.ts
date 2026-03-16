import type { MenuProps } from "antd";

export type DashUserData = {
  name: string;
  description?: string;
  role: string;
  accessLevel?: string;
  url?: string;
};

export type DashUserAvatarProps = {
  data?: DashUserData;
  menu?: MenuProps["items"];
  onClick?: MenuProps["onClick"];
  onSwitchRole?: () => void;
};

export type MainLayoutProps = {
  children: React.ReactNode;
  menuItems: MenuProps["items"];
  /** Optional items fixed at bottom of sidebar (e.g. Settings). Rendered below main nav with a config-style label. */
  bottomMenuItems?: MenuProps["items"];
  userMenuItems: MenuProps["items"];
  userDisplayName: string;
};
