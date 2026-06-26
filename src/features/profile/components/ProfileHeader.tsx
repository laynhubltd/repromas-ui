import { UserAvatar } from "@/shared/ui/UserAvatar";
import { useToken } from "@/shared/hooks/useToken";
import { Flex, Tag, Typography } from "antd";

export type ProfileHeaderProps = {
  displayName: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  profilePictureUrl?: string | null;
  roleLabel?: string;
  isMobile: boolean;
};

export function ProfileHeader({
  displayName,
  email,
  firstName,
  lastName,
  profilePictureUrl,
  roleLabel,
  isMobile,
}: ProfileHeaderProps) {
  const token = useToken();

  return (
    <Flex
      align={isMobile ? "center" : "flex-start"}
      gap={token.paddingMD}
      vertical={isMobile}
      style={{
        width: "100%",
        padding: token.paddingMD,
        borderRadius: token.borderRadiusLG,
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <UserAvatar
        src={profilePictureUrl}
        firstName={firstName}
        lastName={lastName}
        email={email}
        displayName={displayName}
        size={isMobile ? 88 : 96}
      />
      <Flex
        vertical
        gap={6}
        style={{
          minWidth: 0,
          flex: 1,
          textAlign: isMobile ? "center" : "left",
          alignItems: isMobile ? "center" : "flex-start",
        }}
      >
        <Typography.Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
          {displayName}
        </Typography.Title>
        <Typography.Text type="secondary" style={{ wordBreak: "break-all" }}>
          {email}
        </Typography.Text>
        {roleLabel ? (
          <Tag color="blue" style={{ margin: 0 }}>
            {roleLabel}
          </Tag>
        ) : null}
      </Flex>
    </Flex>
  );
}
