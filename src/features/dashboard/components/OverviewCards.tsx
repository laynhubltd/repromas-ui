import React from "react";
import { Col, Flex, Row, Skeleton, Tooltip, Typography } from "antd";
import {
  UsergroupAddOutlined,
  CheckCircleOutlined,
  ApartmentOutlined,
  BookOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { DashCard } from "@/components/ui-kit";
import { useToken } from "@/shared/hooks/useToken";
import { useInstitutionTerminology } from "@/shared/hooks/useInstitutionTerminology";
import { formatCount } from "@/shared/utils/format/formatCount";
import { safePercent } from "../utils/dashboardMath";
import type { OverviewCardsProps } from "../types/dashboard";

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  overview,
  lifecycle,
  structure,
  isLoading,
}) => {
  const token = useToken();
  const { academicUnit } = useInstitutionTerminology();

  if (isLoading) {
    return (
      <Row gutter={[16, 16]}>
        {[1, 2, 3, 4].map((idx) => (
          <Col key={idx} xs={24} sm={12} lg={6}>
            <div
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadiusLG,
                padding: token.paddingLG,
                height: "100%",
                minHeight: 140,
              }}
            >
              <Skeleton active paragraph={{ rows: 2 }} title={{ width: "60%" }} />
            </div>
          </Col>
        ))}
      </Row>
    );
  }

  // Derive headline values
  const enrolledHeadcount =
    lifecycle?.enrolledHeadcount ?? overview?.enrolledStudents ?? 0;
  const goodStandingCount =
    lifecycle?.goodStandingCount ?? overview?.goodStandingStudents ?? 0;
  const academicRiskCount = lifecycle?.academicRiskCount ?? 0;
  const staleTransitionCount = lifecycle?.staleTransitionCount ?? 0;
  const goodStandingPercent = safePercent(goodStandingCount, enrolledHeadcount);

  const totalFaculties =
    structure?.totalFaculties ?? overview?.totalFaculties ?? 0;
  const totalDepartments =
    structure?.totalDepartments ?? overview?.totalDepartments ?? 0;
  const totalMountedCourses =
    structure?.totalMountedCourses ?? overview?.totalMountedCourses ?? 0;

  const activeVersions = structure?.curriculumCompliance.activeVersions ?? 0;
  const totalPrograms =
    structure?.curriculumCompliance.totalPrograms ?? overview?.totalPrograms ?? 0;
  const compliancePercent = safePercent(activeVersions, totalPrograms);

  return (
    <Row gutter={[16, 16]}>
      {/* HERO CARD (Top-Left): Enrolled Headcount */}
      <Col xs={24} sm={12} lg={6}>
        <DashCard
          title="Enrolled Headcount"
          meta="Active non-terminal students"
          value={
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              {formatCount(enrolledHeadcount)}
            </span>
          }
          trend={
            staleTransitionCount > 0 ? (
              <Tooltip title={`${formatCount(staleTransitionCount)} enrolled students have transitions from a prior academic session.`}>
                <Flex align="center" gap={4} style={{ color: token.colorWarning, fontSize: token.fontSizeSM, cursor: "help" }}>
                  <InfoCircleOutlined />
                  <span>{formatCount(staleTransitionCount)} prior session</span>
                </Flex>
              </Tooltip>
            ) : (
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                Current academic session
              </Typography.Text>
            )
          }
          icon={<UsergroupAddOutlined />}
          size="lg"
          density="comfortable"
        />
      </Col>

      {/* SECONDARY CARD: Academic Good Standing */}
      <Col xs={24} sm={12} lg={6}>
        <DashCard
          title="Academic Good Standing"
          meta={`${goodStandingPercent}% of active enrolled`}
          value={
            <Flex align="baseline" gap={8} style={{ fontVariantNumeric: "tabular-nums" }}>
              <span>{formatCount(goodStandingCount)}</span>
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeLG, fontWeight: "normal" }}>
                ({goodStandingPercent}%)
              </Typography.Text>
            </Flex>
          }
          trend={
            <Typography.Text
              style={{
                color: academicRiskCount > 0 ? token.colorError : token.colorSuccess,
                fontSize: token.fontSizeSM,
              }}
            >
              {academicRiskCount > 0
                ? `${formatCount(academicRiskCount)} students in academic risk`
                : "No students on probation"}
            </Typography.Text>
          }
          icon={<CheckCircleOutlined />}
          size="md"
          density="comfortable"
        />
      </Col>

      {/* TERTIARY CARD: Academic Footprint */}
      <Col xs={24} sm={12} lg={6}>
        <DashCard
          title={academicUnit.plural}
          meta={`Across ${formatCount(totalDepartments)} departments`}
          value={
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              {formatCount(totalFaculties)}
            </span>
          }
          trend={
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {formatCount(totalMountedCourses)} courses mounted
            </Typography.Text>
          }
          icon={<ApartmentOutlined />}
          size="md"
          density="comfortable"
        />
      </Col>

      {/* TERTIARY CARD: Curriculum Compliance */}
      <Col xs={24} sm={12} lg={6}>
        <DashCard
          title="Curriculum Versions"
          meta={`${compliancePercent}% active coverage`}
          value={
            <Flex align="baseline" gap={6} style={{ fontVariantNumeric: "tabular-nums" }}>
              <span>{formatCount(activeVersions)}</span>
              <Typography.Text type="secondary" style={{ fontSize: token.fontSize, fontWeight: "normal" }}>
                / {formatCount(totalPrograms)} programs
              </Typography.Text>
            </Flex>
          }
          trend={
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {totalPrograms - activeVersions > 0
                ? `${totalPrograms - activeVersions} pending curriculum`
                : "All programs configured"}
            </Typography.Text>
          }
          icon={<BookOutlined />}
          size="md"
          density="comfortable"
        />
      </Col>
    </Row>
  );
};
