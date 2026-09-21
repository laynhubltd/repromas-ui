import { useToken } from "@/shared/hooks/useToken";
import {
  CheckCircleOutlined,
  EditOutlined,
  RiseOutlined,
  TeamOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Divider, Flex, Skeleton, Tag, Tooltip, Typography } from "antd";
import type { CohortStatistics } from "../types/result-broadsheet";
import { formatPercentage } from "../utils/formatters";

export interface BroadsheetMetricsRowProps {
  statistics?: CohortStatistics;
  isLoading?: boolean;
}

export function BroadsheetMetricsRow({
  statistics,
  isLoading = false,
}: BroadsheetMetricsRowProps) {
  const token = useToken();

  const totalRegistered =
    statistics?.totalRegistered ?? statistics?.totalStudents ?? 0;
  const totalSat = statistics?.totalSatForExam ?? 0;
  const totalPassed = statistics?.passedCount ?? statistics?.totalPassed ?? 0;
  const probationCount = statistics?.probationCount ?? 0;
  const repeatCount = statistics?.repeatCount ?? 0;
  const withdrawnCount = statistics?.withdrawnCount ?? 0;
  const successRate = statistics?.successRate ?? 0;

  const atRiskTotal = probationCount + repeatCount + withdrawnCount;

  if (isLoading) {
    return (
      <div
        style={{
          padding: "6px 14px",
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusLG,
          width: "100%",
        }}
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
          <Skeleton.Input size="small" active style={{ width: 100 }} />
          <Skeleton.Input size="small" active style={{ width: 100 }} />
          <Skeleton.Input size="small" active style={{ width: 120 }} />
          <Skeleton.Input size="small" active style={{ width: 120 }} />
          <Skeleton.Input size="small" active style={{ width: 90 }} />
        </Flex>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "6px 14px",
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Flex
        align="center"
        justify="space-between"
        wrap="wrap"
        gap={token.marginSM}
        style={{ width: "100%" }}
      >
        {/* 1. Registered */}
        <Flex align="center" gap={token.marginXS}>
          <TeamOutlined style={{ color: token.colorTextSecondary, fontSize: 13 }} />
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            Registered:
          </Typography.Text>
          <Typography.Text strong style={{ fontSize: token.fontSize }}>
            {totalRegistered}
          </Typography.Text>
        </Flex>

        <Divider type="vertical" style={{ margin: 0 }} />

        {/* 2. Sat for Exam */}
        <Flex align="center" gap={token.marginXS}>
          <EditOutlined style={{ color: token.colorTextSecondary, fontSize: 13 }} />
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            Sat for Exam:
          </Typography.Text>
          <Typography.Text strong style={{ fontSize: token.fontSize }}>
            {totalSat}
          </Typography.Text>
        </Flex>

        <Divider type="vertical" style={{ margin: 0 }} />

        {/* 3. Passed (Good Standing) */}
        <Flex align="center" gap={token.marginXS}>
          <CheckCircleOutlined style={{ color: token.colorSuccess, fontSize: 13 }} />
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            Passed:
          </Typography.Text>
          <Typography.Text
            strong
            style={{ fontSize: token.fontSize, color: token.colorSuccess }}
          >
            {totalPassed}
          </Typography.Text>
          <Tag color="success" style={{ margin: 0, fontSize: token.fontSizeSM - 2, padding: "0 4px", lineHeight: "16px" }}>
            Good Standing
          </Tag>
        </Flex>

        <Divider type="vertical" style={{ margin: 0 }} />

        {/* 4. At-Risk / Interventions */}
        <Tooltip
          title={`Probation: ${probationCount} · Repeat: ${repeatCount} · Withdrawn: ${withdrawnCount}`}
        >
          <Flex align="center" gap={token.marginXS} style={{ cursor: "pointer" }}>
            <WarningOutlined
              style={{
                color: atRiskTotal > 0 ? token.colorWarning : token.colorTextTertiary,
                fontSize: 13,
              }}
            />
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              At-Risk:
            </Typography.Text>
            <Typography.Text
              strong
              style={{
                fontSize: token.fontSize,
                color: atRiskTotal > 0 ? token.colorWarningText : token.colorText,
              }}
            >
              {atRiskTotal}
            </Typography.Text>
            {atRiskTotal > 0 && (
              <Tag
                color="warning"
                style={{
                  margin: 0,
                  fontSize: token.fontSizeSM - 2,
                  padding: "0 4px",
                  lineHeight: "16px",
                }}
              >
                {probationCount} Prob
              </Tag>
            )}
          </Flex>
        </Tooltip>

        <Divider type="vertical" style={{ margin: 0 }} />

        {/* 5. Success Rate */}
        <Flex align="center" gap={token.marginXS}>
          <RiseOutlined style={{ color: token.colorPrimary, fontSize: 13 }} />
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            Pass Rate:
          </Typography.Text>
          <Typography.Text
            strong
            style={{ fontSize: token.fontSize, color: token.colorPrimary }}
          >
            {formatPercentage(successRate)}
          </Typography.Text>
        </Flex>
      </Flex>
    </div>
  );
}
