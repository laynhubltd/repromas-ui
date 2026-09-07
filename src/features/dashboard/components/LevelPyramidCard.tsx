import React from "react";
import { Card, Empty, Flex, Skeleton, Typography } from "antd";
import { useToken } from "@/shared/hooks/useToken";
import { formatCount } from "@/shared/utils/format/formatCount";
import { safePercent } from "../utils/dashboardMath";
import type { LevelPyramidCardProps } from "../types/dashboard";

export const LevelPyramidCard: React.FC<LevelPyramidCardProps> = ({
  levelDistribution = [],
  enrolledHeadcount = 0,
  isLoading,
}) => {
  const token = useToken();

  if (isLoading) {
    return (
      <Card
        title="Student Distribution by Level"
        style={{ height: "100%", borderRadius: token.borderRadiusLG }}
      >
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    );
  }

  // Sort strictly by rankOrder
  const sortedLevels = [...levelDistribution].sort(
    (a, b) => a.rankOrder - b.rankOrder
  );

  const maxCount = Math.max(...sortedLevels.map((l) => l.count), 1);

  return (
    <Card
      title="Student Distribution by Level"
      extra={
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {sortedLevels.length} Configured Levels
        </Typography.Text>
      }
      style={{ height: "100%", borderRadius: token.borderRadiusLG }}
    >
      {sortedLevels.length === 0 ? (
        <Empty description="No level distribution data available" />
      ) : (
        <Flex vertical gap={12}>
          {sortedLevels.map((item) => {
            const levelPercent = safePercent(item.count, enrolledHeadcount);
            const relativeWidth = Math.max(4, Math.round((item.count / maxCount) * 100));

            return (
              <div key={item.levelId} style={{ width: "100%" }}>
                <Flex justify="space-between" align="center" style={{ marginBottom: 4 }}>
                  <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
                    {item.levelName}
                  </Typography.Text>
                  <Flex align="center" gap={6}>
                    <Typography.Text strong style={{ fontVariantNumeric: "tabular-nums" }}>
                      {formatCount(item.count)}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                      ({levelPercent}%)
                    </Typography.Text>
                  </Flex>
                </Flex>

                <div
                  style={{
                    height: 10,
                    borderRadius: token.borderRadiusSM,
                    background: token.colorBgLayout,
                    overflow: "hidden",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${relativeWidth}%`,
                      borderRadius: token.borderRadiusSM,
                      background: token.colorPrimary,
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </Flex>
      )}
    </Card>
  );
};
