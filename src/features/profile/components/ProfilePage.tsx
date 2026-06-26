import { useIsMobile, useIsXs } from "@/hooks/useBreakpoint";
import {
  PROFILE_PAGE_SUBTITLE,
  PROFILE_PAGE_TITLE,
} from "@/shared/constants/profilePageOptions";
import { useToken } from "@/shared/hooks/useToken";
import { Col, Flex, Row, Typography } from "antd";
import { ChangePasswordSection } from "./ChangePasswordSection";
import { ProfileHeader } from "./ProfileHeader";
import { ProfilePictureSection } from "./ProfilePictureSection";
import { useProfilePage } from "../hooks/useProfilePage";

export default function ProfilePage() {
  const token = useToken();
  const isMobile = useIsMobile();
  const isXs = useIsXs() === true;
  const { state } = useProfilePage();

  const pagePadding = isXs
    ? token.paddingXS
    : isMobile
      ? token.paddingSM
      : token.paddingLG;

  return (
    <Flex
      vertical
      gap={token.paddingMD}
      style={{
        width: "100%",
        maxWidth: isMobile ? 720 : 1040,
        margin: "0 auto",
        padding: pagePadding,
        paddingBottom: isMobile
          ? `max(${token.paddingMD}px, env(safe-area-inset-bottom, 0px))`
          : pagePadding,
        boxSizing: "border-box",
      }}
    >
      <Flex vertical gap={4}>
        <Typography.Title level={isMobile ? 4 : 3} style={{ margin: 0 }}>
          {PROFILE_PAGE_TITLE}
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {PROFILE_PAGE_SUBTITLE}
        </Typography.Text>
      </Flex>

      <ProfileHeader
        displayName={state.displayName}
        email={state.email}
        firstName={state.firstName}
        lastName={state.lastName}
        profilePictureUrl={state.profilePictureUrl}
        roleLabel={state.roleLabel}
        isMobile={isMobile}
      />

      <Row gutter={[token.paddingMD, token.paddingMD]}>
        <Col xs={24} md={12}>
          <ProfilePictureSection />
        </Col>
        <Col xs={24} md={12}>
          <ChangePasswordSection />
        </Col>
      </Row>
    </Flex>
  );
}
