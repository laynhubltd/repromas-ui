import { Card, Col, Descriptions, Row, Typography } from "antd";
import type { CohortStatistics } from "../types/result-broadsheet";
import { formatPercentage } from "../utils/formatters";

export interface CohortStatisticsCardsProps {
  statistics?: CohortStatistics;
}

export function CohortStatisticsCards({ statistics }: CohortStatisticsCardsProps) {
  if (!statistics) return null;

  const passed = statistics.totalPassed ?? statistics.passedCount ?? 0;
  const failed =
    statistics.totalFailed ??
    Math.max(0, (statistics.totalSatForExam ?? 0) - passed);

  return (
    <Card
      size="small"
      title={<Typography.Text strong>Cohort Assessment Statistics</Typography.Text>}
    >
      <Row gutter={[24, 16]}>
        <Col xs={24} md={12}>
          <Descriptions
            bordered
            size="small"
            title="Participation & Headcount"
            column={1}
          >
            <Descriptions.Item label="Total Registered Students">
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {statistics.totalRegistered}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Total Sat for Examination">
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {statistics.totalSatForExam}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Passed (In Good Standing)">
              <span style={{ fontVariantNumeric: "tabular-nums", color: "#52c41a", fontWeight: 600 }}>
                {passed}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Failed / Below Standard">
              <span style={{ fontVariantNumeric: "tabular-nums", color: "#ff4d4f" }}>
                {failed}
              </span>
            </Descriptions.Item>
          </Descriptions>
        </Col>

        <Col xs={24} md={12}>
          <Descriptions
            bordered
            size="small"
            title="Standing Classifications & Performance"
            column={1}
          >
            <Descriptions.Item label="Probation Count">
              <span style={{ fontVariantNumeric: "tabular-nums", color: "#fa8c16" }}>
                {statistics.probationCount}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Repeat Count">
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {statistics.repeatCount}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Withdrawn Count">
              <span style={{ fontVariantNumeric: "tabular-nums", color: "#ff4d4f" }}>
                {statistics.withdrawnCount}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Spillover Count">
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {statistics.spillOverCount}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="With Carryovers / Clear">
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {statistics.withCarryoverCount} with carryover / {statistics.withoutCarryoverCount} clear
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Overall Success Rate">
              <Typography.Text strong style={{ fontVariantNumeric: "tabular-nums" }}>
                {formatPercentage(statistics.successRate)}
              </Typography.Text>
            </Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </Card>
  );
}
