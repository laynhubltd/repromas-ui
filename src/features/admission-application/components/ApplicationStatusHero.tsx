import { useToken } from "@/shared/hooks/useToken";
import { Flex, Tag, Typography } from "antd";
import type { StatusDisplay } from "../constants/meAdmissionApplicationOptions";

type ApplicationStatusHeroProps = {
  applicationStatus: StatusDisplay;
  finalDecision: StatusDisplay;
  cycleName?: string;
  appliedProgramName?: string;
  lastUpdated?: string;
};

export function ApplicationStatusHero({
  applicationStatus,
  finalDecision,
  cycleName,
  appliedProgramName,
  lastUpdated,
}: ApplicationStatusHeroProps) {
  const token = useToken();

  return (
    <Flex vertical gap={12}>
      <Flex align="center" gap={8} wrap="wrap">
        <Tag color={applicationStatus.color}>{applicationStatus.label}</Tag>
        <Tag color={finalDecision.color}>{finalDecision.label}</Tag>
      </Flex>
      {cycleName ? (
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {cycleName}
        </Typography.Text>
      ) : null}
      {appliedProgramName ? (
        <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
          {appliedProgramName}
        </Typography.Text>
      ) : null}
      {lastUpdated ? (
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {lastUpdated}
        </Typography.Text>
      ) : null}
    </Flex>
  );
}
