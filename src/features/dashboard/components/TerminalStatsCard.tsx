import React from "react";
import { Card, Col, Flex, Row, Skeleton, Tag, Typography } from "antd";
import {
  TrophyOutlined,
  UserDeleteOutlined,
  FieldTimeOutlined,
} from "@ant-design/icons";
import { useToken } from "@/shared/hooks/useToken";
import { formatCount } from "@/shared/utils/format/formatCount";
import type { TerminalStatsCardProps } from "../types/dashboard";

export const TerminalStatsCard: React.FC<TerminalStatsCardProps> = ({
  lifecycle,
  isLoading,
}) => {
  const token = useToken();

  if (isLoading) {
    return (
      <Card
        title="Historical Completions & Student Exits"
        style={{ height: "100%", borderRadius: token.borderRadiusLG }}
      >
        <Skeleton active paragraph={{ rows: 3 }} />
      </Card>
    );
  }

  const graduatedCount = lifecycle?.graduatedCount ?? 0;
  const attritionCount = lifecycle?.attritionCount ?? 0;
  const spilloverCount = lifecycle?.totalSpilloverCount ?? 0;
  const totalTerminalCount = lifecycle?.totalTerminalCount ?? 0;

  return (
    <Card
      title="Historical Completions & Student Exits"
      extra={
        <Tag color="default" style={{ margin: 0 }}>
          {formatCount(totalTerminalCount)} Total Exits Recorded
        </Tag>
      }
      style={{ height: "100%", borderRadius: token.borderRadiusLG }}
    >
      <Row gutter={[16, 16]}>
        {/* Graduated Alumni */}
        <Col xs={24} sm={8}>
          <div
            style={{
              padding: token.paddingSM,
              borderRadius: token.borderRadius,
              background: token.colorBgLayout,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Flex align="center" gap={8} style={{ marginBottom: 4 }}>
              <TrophyOutlined style={{ color: token.colorPrimary, fontSize: 16 }} />
              <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
                Graduated Alumni
              </Typography.Text>
            </Flex>
            <Typography.Title level={4} style={{ margin: 0, fontVariantNumeric: "tabular-nums" }}>
              {formatCount(graduatedCount)}
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              Successful completions
            </Typography.Text>
          </div>
        </Col>

        {/* Academic Attrition */}
        <Col xs={24} sm={8}>
          <div
            style={{
              padding: token.paddingSM,
              borderRadius: token.borderRadius,
              background: token.colorBgLayout,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Flex align="center" gap={8} style={{ marginBottom: 4 }}>
              <UserDeleteOutlined style={{ color: token.colorError, fontSize: 16 }} />
              <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
                Academic Attrition
              </Typography.Text>
            </Flex>
            <Typography.Title level={4} style={{ margin: 0, fontVariantNumeric: "tabular-nums" }}>
              {formatCount(attritionCount)}
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              Withdrawals & dismissals
            </Typography.Text>
          </div>
        </Col>

        {/* Spillover Students */}
        <Col xs={24} sm={8}>
          <div
            style={{
              padding: token.paddingSM,
              borderRadius: token.borderRadius,
              background: token.colorBgLayout,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Flex align="center" gap={8} style={{ marginBottom: 4 }}>
              <FieldTimeOutlined style={{ color: token.colorWarning, fontSize: 16 }} />
              <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
                Spillover Students
              </Typography.Text>
            </Flex>
            <Typography.Title level={4} style={{ margin: 0, fontVariantNumeric: "tabular-nums" }}>
              {formatCount(spilloverCount)}
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              Extended residency load
            </Typography.Text>
          </div>
        </Col>
      </Row>
    </Card>
  );
};
