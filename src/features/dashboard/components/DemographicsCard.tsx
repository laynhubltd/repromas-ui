import React from "react";
import { Card, Col, Flex, Progress, Row, Skeleton, Typography } from "antd";
import { useToken } from "@/shared/hooks/useToken";
import { formatCount } from "@/shared/utils/format/formatCount";
import { safePercent } from "../utils/dashboardMath";
import type { DemographicsCardProps } from "../types/dashboard";

export const DemographicsCard: React.FC<DemographicsCardProps> = ({
  lifecycle,
  isLoading,
}) => {
  const token = useToken();

  if (isLoading) {
    return (
      <Card
        title="Student Intake & Demographics"
        style={{ height: "100%", borderRadius: token.borderRadiusLG }}
      >
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  const enrolledHeadcount = lifecycle?.enrolledHeadcount ?? 0;
  const entryMode = lifecycle?.entryModeDistribution ?? {};
  const gender = lifecycle?.genderDistribution ?? {};

  const maleCount = gender.MALE ?? 0;
  const femaleCount = gender.FEMALE ?? 0;
  const otherCount = gender.UNKNOWN ?? gender.OTHER ?? 0;

  const malePercent = safePercent(maleCount, enrolledHeadcount);
  const femalePercent = safePercent(femaleCount, enrolledHeadcount);
  const otherPercent = safePercent(otherCount, enrolledHeadcount);

  return (
    <Card
      title="Student Intake & Demographics"
      style={{ height: "100%", borderRadius: token.borderRadiusLG }}
    >
      <Row gutter={[24, 20]}>
        {/* Entry Mode Distribution */}
        <Col xs={24} md={12}>
          <Typography.Text
            strong
            style={{ fontSize: token.fontSizeSM, display: "block", marginBottom: 10 }}
          >
            Entry Mode Breakdown
          </Typography.Text>
          <Flex vertical gap={10}>
            {Object.entries(entryMode).map(([mode, count]) => {
              const percent = safePercent(count, enrolledHeadcount);
              const label = mode.replace("_", " ");
              return (
                <div key={mode}>
                  <Flex justify="space-between" style={{ fontSize: token.fontSizeSM, marginBottom: 2 }}>
                    <span>{label}</span>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>
                      <strong>{formatCount(count)}</strong> ({percent}%)
                    </span>
                  </Flex>
                  <Progress percent={percent} showInfo={false} size="small" strokeColor={token.colorPrimary} />
                </div>
              );
            })}
          </Flex>
        </Col>

        {/* Gender Distribution */}
        <Col xs={24} md={12}>
          <Typography.Text
            strong
            style={{ fontSize: token.fontSizeSM, display: "block", marginBottom: 10 }}
          >
            Gender Demographics
          </Typography.Text>
          <Flex vertical gap={10}>
            <div>
              <Flex justify="space-between" style={{ fontSize: token.fontSizeSM, marginBottom: 2 }}>
                <span>Male</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  <strong>{formatCount(maleCount)}</strong> ({malePercent}%)
                </span>
              </Flex>
              <Progress percent={malePercent} showInfo={false} size="small" strokeColor="#1890ff" />
            </div>

            <div>
              <Flex justify="space-between" style={{ fontSize: token.fontSizeSM, marginBottom: 2 }}>
                <span>Female</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>
                  <strong>{formatCount(femaleCount)}</strong> ({femalePercent}%)
                </span>
              </Flex>
              <Progress percent={femalePercent} showInfo={false} size="small" strokeColor="#eb2f96" />
            </div>

            {otherCount > 0 && (
              <div>
                <Flex justify="space-between" style={{ fontSize: token.fontSizeSM, marginBottom: 2 }}>
                  <span>Unspecified / Other</span>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>
                    <strong>{formatCount(otherCount)}</strong> ({otherPercent}%)
                  </span>
                </Flex>
                <Progress percent={otherPercent} showInfo={false} size="small" strokeColor={token.colorTextTertiary} />
              </div>
            )}
          </Flex>
        </Col>
      </Row>
    </Card>
  );
};
