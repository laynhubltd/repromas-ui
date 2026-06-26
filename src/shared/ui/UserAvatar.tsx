import { UserOutlined } from "@ant-design/icons";
import { Avatar } from "antd";
import type { CSSProperties, ReactNode } from "react";
import { useToken } from "@/shared/hooks/useToken";
import { getAvatarInitials } from "@/shared/utils/avatar/getAvatarDisplay";

export type UserAvatarProps = {
  src?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  displayName?: string;
  size?: number;
  icon?: ReactNode;
};

const DEFAULT_AVATAR_SIZE = 40;

export function UserAvatar({
  src,
  firstName,
  lastName,
  email,
  displayName,
  size = DEFAULT_AVATAR_SIZE,
  icon,
}: UserAvatarProps) {
  const token = useToken();
  const imageSrc = src?.trim() || undefined;
  const initials =
    getAvatarInitials(firstName, lastName, email) ??
    displayName
      ?.split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const hasPhoto = Boolean(imageSrc);

  const frameStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    padding: 2,
    borderRadius: "50%",
    background: hasPhoto
      ? `linear-gradient(145deg, ${token.colorPrimary}, ${token.colorPrimaryBorder ?? token.colorPrimary})`
      : token.colorPrimary,
    boxShadow: token.boxShadowSecondary,
  };

  const avatarStyle: CSSProperties = {
    border: `2px solid ${token.colorBgContainer}`,
    fontWeight: 600,
    fontSize: token.fontSizeSM,
    background: hasPhoto
      ? token.colorBgContainer
      : `linear-gradient(160deg, ${token.colorPrimary}, ${token.colorPrimaryActive ?? token.colorPrimary})`,
    color: token.colorTextLightSolid,
    objectFit: "cover",
  };

  return (
    <span style={frameStyle}>
      {hasPhoto ? (
        <Avatar src={imageSrc} size={size} style={avatarStyle} />
      ) : initials ? (
        <Avatar size={size} style={avatarStyle}>
          {initials}
        </Avatar>
      ) : (
        <Avatar
          icon={icon ?? <UserOutlined />}
          size={size}
          style={avatarStyle}
        />
      )}
    </span>
  );
}
